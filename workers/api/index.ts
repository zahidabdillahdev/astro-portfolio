/// <reference types="@cloudflare/workers-types" />

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { cfAccessMiddleware } from './middleware/cloudflare-access';

// Define the environment type
interface Env {
  DB: D1Database;
  STORAGE: R2Bucket;
  ENVIRONMENT: string;
  ASSETS_URL: string;
  PAGES_DEPLOY_HOOK_URL: string;
}

const app = new Hono<{ Bindings: Env }>();

function getRows<T = Record<string, unknown>>(result: D1Result<T> | null | undefined): T[] {
  return (result?.results as T[] | undefined) || [];
}

function getAssetKeyFromUrl(url: string | null | undefined, assetsBaseUrl: string): string | null {
  if (!url) return null;

  try {
    const assetUrl = new URL(url);
    const assetsBase = new URL(assetsBaseUrl);
    if (assetUrl.origin !== assetsBase.origin) return null;

    return assetUrl.pathname.replace(/^\/+/, '') || null;
  } catch {
    return null;
  }
}

async function deleteManagedAsset(c: any, url: string | null | undefined) {
  const key = getAssetKeyFromUrl(url, c.env.ASSETS_URL);
  if (!key) return;

  await c.env.STORAGE.delete(key);
}

async function reorderByIds(c: any, table: string, ids: number[]) {
  const statements = ids.map((id, index) =>
    c.env.DB.prepare(`UPDATE ${table} SET order_index = ? WHERE id = ?`).bind(index, id)
  );

  await c.env.DB.batch(statements);
}

// Enable CORS for all routes
app.use('*', cors());

// Public routes
app.get('/api/profile', async (c) => {
  try {
    const result = await c.env.DB.prepare(
      `SELECT * FROM profile WHERE id = 1`
    ).first();

    if (!result) {
      return c.json({
        full_name: '', title: '', about: '', summary: '',
        email: '', tel: '', location: '',
        avatar_url: '', resume_url: '', linkedin_url: '', website_url: ''
      });
    }

    return c.json(result);
  } catch (error) {
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

app.get('/api/projects', async (c) => {
  try {
    const result = await c.env.DB.prepare(
      `SELECT * FROM projects ORDER BY is_featured DESC, order_index ASC`
    ).all();

    // Parse JSON fields
    const projects = getRows(result).map((project: any) => {
      let parsedResults = {};
      let parsedTags = [];
      
      try {
        if (project.results) parsedResults = JSON.parse(project.results as string);
      } catch (e) {
        console.error('Error parsing project results:', e);
      }
      
      try {
        if (project.tags) parsedTags = JSON.parse(project.tags as string);
      } catch (e) {
        console.error('Error parsing project tags:', e);
      }

      return {
        ...project,
        results: parsedResults,
        tags: parsedTags
      };
    });

    return c.json(projects);
  } catch (error) {
    return c.json({ error: 'Failed to fetch projects' }, 500);
  }
});

app.get('/api/certifications', async (c) => {
  try {
    const result = await c.env.DB.prepare(
      `SELECT * FROM certifications ORDER BY order_index ASC`
    ).all();

    return c.json(getRows(result));
  } catch (error) {
    return c.json({ error: 'Failed to fetch certifications' }, 500);
  }
});

app.get('/api/experience', async (c) => {
  try {
    const result = await c.env.DB.prepare(
      `SELECT * FROM work_experience ORDER BY order_index ASC`
    ).all();

    // Parse JSON fields
    const experiences = getRows(result).map((exp: any) => {
      let parsedAchievements = [];
      let parsedBadges = [];
      
      try {
        if (exp.achievements) parsedAchievements = JSON.parse(exp.achievements as string);
      } catch (e) {
        console.error('Error parsing achievements:', e);
      }
      
      try {
        if (exp.badges) parsedBadges = JSON.parse(exp.badges as string);
      } catch (e) {
        console.error('Error parsing badges:', e);
      }

      return {
        ...exp,
        achievements: parsedAchievements,
        badges: parsedBadges
      };
    });

    return c.json(experiences);
  } catch (error) {
    return c.json({ error: 'Failed to fetch experience' }, 500);
  }
});

app.get('/api/skills', async (c) => {
  try {
    const result = await c.env.DB.prepare(
      `SELECT * FROM skills ORDER BY order_index ASC`
    ).all();

    return c.json(getRows(result));
  } catch (error) {
    return c.json({ error: 'Failed to fetch skills' }, 500);
  }
});

app.get('/api/education', async (c) => {
  try {
    const result = await c.env.DB.prepare(
      `SELECT * FROM education ORDER BY order_index ASC`
    ).all();

    return c.json(getRows(result));
  } catch (error) {
    return c.json({ error: 'Failed to fetch education' }, 500);
  }
});

// Admin routes - protected by cfAccessMiddleware
app.use('/api/admin/*', cfAccessMiddleware);

app.put('/api/admin/profile', async (c) => {
  try {
    const payload = await c.req.json();

    // Check if profile exists, if not create it
    const existingProfile = await c.env.DB.prepare(
      `SELECT * FROM profile WHERE id = 1`
    ).first();

    const mergedProfile = {
      full_name: '',
      title: '',
      about: '',
      summary: '',
      email: '',
      tel: '',
      location: '',
      avatar_url: '',
      resume_url: '',
      linkedin_url: '',
      ...(existingProfile || {}),
      ...payload
    } as Record<string, string>;

    if (
      typeof payload.avatar_url !== 'undefined' &&
      existingProfile &&
      payload.avatar_url !== existingProfile.avatar_url
    ) {
      await deleteManagedAsset(c, existingProfile.avatar_url as string | undefined);
    }

    if (
      typeof payload.resume_url !== 'undefined' &&
      existingProfile &&
      payload.resume_url !== existingProfile.resume_url
    ) {
      await deleteManagedAsset(c, existingProfile.resume_url as string | undefined);
    }

    if (existingProfile) {
      // Update existing profile
      await c.env.DB.prepare(
        `UPDATE profile SET
          full_name = ?, title = ?, about = ?, summary = ?,
          email = ?, tel = ?, location = ?,
          avatar_url = ?, resume_url = ?, linkedin_url = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = 1`
      ).bind(
        mergedProfile.full_name,
        mergedProfile.title,
        mergedProfile.about,
        mergedProfile.summary,
        mergedProfile.email,
        mergedProfile.tel,
        mergedProfile.location,
        mergedProfile.avatar_url,
        mergedProfile.resume_url,
        mergedProfile.linkedin_url
      ).run();
    } else {
      // Create new profile
      await c.env.DB.prepare(
        `INSERT INTO profile
          (id, full_name, title, about, summary, email, tel, location,
           avatar_url, resume_url, linkedin_url)
         VALUES
          (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        mergedProfile.full_name,
        mergedProfile.title,
        mergedProfile.about,
        mergedProfile.summary,
        mergedProfile.email,
        mergedProfile.tel,
        mergedProfile.location,
        mergedProfile.avatar_url,
        mergedProfile.resume_url,
        mergedProfile.linkedin_url
      ).run();
    }

    return c.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// Projects admin routes
app.post('/api/admin/projects', async (c) => {
  try {
    const project = await c.req.json();
    
    // Validate required fields
    if (!project.title || !project.slug) {
      return c.json({ error: 'Title and slug are required' }, 400);
    }

    const resultsJson = JSON.stringify(project.results || {});
    const tagsJson = JSON.stringify(project.tags || []);

    const stmt = c.env.DB.prepare(
      `INSERT INTO projects 
        (title, slug, description, category, client, thumbnail_url, 
         link_type, link_url, results, tags, is_featured, order_index) 
       VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    await stmt.bind(
      project.title, 
      project.slug, 
      project.description || '', 
      project.category || '', 
      project.client || '', 
      project.thumbnail_url || '', 
      project.link_type || 'url', 
      project.link_url || '', 
      resultsJson, 
      tagsJson, 
      project.is_featured ? 1 : 0, 
      project.order_index || 0
    ).run();

    return c.json({ success: true, message: 'Project created successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to create project' }, 500);
  }
});

app.put('/api/admin/projects/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const project = await c.req.json();
    
    const resultsJson = JSON.stringify(project.results || {});
    const tagsJson = JSON.stringify(project.tags || []);

    const stmt = c.env.DB.prepare(
      `UPDATE projects SET 
        title = ?, slug = ?, description = ?, category = ?, client = ?, thumbnail_url = ?, 
        link_type = ?, link_url = ?, results = ?, tags = ?, is_featured = ?, order_index = ?
       WHERE id = ?`
    );

    await stmt.bind(
      project.title, 
      project.slug, 
      project.description || '', 
      project.category || '', 
      project.client || '', 
      project.thumbnail_url || '', 
      project.link_type || 'url', 
      project.link_url || '', 
      resultsJson, 
      tagsJson, 
      project.is_featured ? 1 : 0, 
      project.order_index || 0,
      parseInt(id, 10)
    ).run();

    return c.json({ success: true, message: 'Project updated successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to update project' }, 500);
  }
});

app.delete('/api/admin/projects/:id', async (c) => {
  try {
    const id = c.req.param('id');

    await c.env.DB.prepare(
      `DELETE FROM projects WHERE id = ?`
    ).bind(parseInt(id, 10)).run();

    return c.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to delete project' }, 500);
  }
});

app.post('/api/admin/projects/reorder', async (c) => {
  try {
    const { ids } = await c.req.json();
    if (!Array.isArray(ids) || ids.some((id) => !Number.isInteger(id))) {
      return c.json({ error: 'A numeric ids array is required' }, 400);
    }

    await reorderByIds(c, 'projects', ids);
    return c.json({ success: true, message: 'Project order updated successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to reorder projects' }, 500);
  }
});

// Certifications admin routes
app.post('/api/admin/certifications', async (c) => {
  try {
    const cert = await c.req.json();
    
    // Validate required fields
    if (!cert.title || !cert.issuer) {
      return c.json({ error: 'Title and issuer are required' }, 400);
    }

    const stmt = c.env.DB.prepare(
      `INSERT INTO certifications 
        (title, issuer, issue_date, expiry_date, credential_id, credential_url,
         certificate_url, thumbnail_url, order_index) 
       VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    await stmt.bind(
      cert.title, 
      cert.issuer, 
      cert.issueDate || '', 
      cert.expiryDate || '', 
      cert.credentialId || '', 
      cert.credentialUrl || '', 
      cert.certificateUrl || '', 
      cert.thumbnailUrl || '', 
      cert.orderIndex || 0
    ).run();

    return c.json({ success: true, message: 'Certification created successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to create certification' }, 500);
  }
});

app.put('/api/admin/certifications/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const cert = await c.req.json();
    const certId = parseInt(id, 10);
    const existingCert = await c.env.DB.prepare(
      `SELECT * FROM certifications WHERE id = ?`
    ).bind(certId).first();

    if (!existingCert) {
      return c.json({ error: 'Certification not found' }, 404);
    }

    if (
      typeof cert.certificateUrl !== 'undefined' &&
      cert.certificateUrl !== existingCert.certificate_url
    ) {
      await deleteManagedAsset(c, existingCert.certificate_url as string | undefined);
    }

    const stmt = c.env.DB.prepare(
      `UPDATE certifications SET 
        title = ?, issuer = ?, issue_date = ?, expiry_date = ?, credential_id = ?, credential_url = ?,
        certificate_url = ?, thumbnail_url = ?, order_index = ?
       WHERE id = ?`
    );

    await stmt.bind(
      cert.title, 
      cert.issuer, 
      cert.issueDate || '', 
      cert.expiryDate || '', 
      cert.credentialId || '', 
      cert.credentialUrl || '', 
      cert.certificateUrl || '', 
      cert.thumbnailUrl || '', 
      cert.orderIndex || 0,
      certId
    ).run();

    return c.json({ success: true, message: 'Certification updated successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to update certification' }, 500);
  }
});

app.delete('/api/admin/certifications/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const certId = parseInt(id, 10);
    const existingCert = await c.env.DB.prepare(
      `SELECT * FROM certifications WHERE id = ?`
    ).bind(certId).first();

    if (!existingCert) {
      return c.json({ error: 'Certification not found' }, 404);
    }

    await c.env.DB.prepare(
      `DELETE FROM certifications WHERE id = ?`
    ).bind(certId).run();

    await deleteManagedAsset(c, existingCert.certificate_url as string | undefined);

    return c.json({ success: true, message: 'Certification deleted successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to delete certification' }, 500);
  }
});

app.post('/api/admin/certifications/reorder', async (c) => {
  try {
    const { ids } = await c.req.json();
    if (!Array.isArray(ids) || ids.some((id) => !Number.isInteger(id))) {
      return c.json({ error: 'A numeric ids array is required' }, 400);
    }

    await reorderByIds(c, 'certifications', ids);
    return c.json({ success: true, message: 'Certification order updated successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to reorder certifications' }, 500);
  }
});

// Experience admin routes
app.post('/api/admin/experience', async (c) => {
  try {
    const exp = await c.req.json();
    
    // Validate required fields
    if (!exp.company || !exp.role || !exp.startDate) {
      return c.json({ error: 'Company, role, and start date are required' }, 400);
    }

    const achievementsJson = JSON.stringify(exp.achievements || []);
    const badgesJson = JSON.stringify(exp.badges || []);

    const stmt = c.env.DB.prepare(
      `INSERT INTO work_experience 
        (company, company_link, role, description, start_date, end_date, 
         is_current, achievements, badges, logo_url, order_index) 
       VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    await stmt.bind(
      exp.company, 
      exp.companyLink || '', 
      exp.role, 
      exp.description || '', 
      exp.startDate, 
      exp.endDate || null, 
      exp.isCurrent ? 1 : 0,
      achievementsJson, 
      badgesJson, 
      exp.logoUrl || '', 
      exp.orderIndex || 0
    ).run();

    return c.json({ success: true, message: 'Experience created successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to create experience' }, 500);
  }
});

app.put('/api/admin/experience/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const exp = await c.req.json();

    const achievementsJson = JSON.stringify(exp.achievements || []);
    const badgesJson = JSON.stringify(exp.badges || []);

    const stmt = c.env.DB.prepare(
      `UPDATE work_experience SET 
        company = ?, company_link = ?, role = ?, description = ?, start_date = ?, end_date = ?, 
        is_current = ?, achievements = ?, badges = ?, logo_url = ?, order_index = ?
       WHERE id = ?`
    );

    await stmt.bind(
      exp.company, 
      exp.companyLink || '', 
      exp.role, 
      exp.description || '', 
      exp.startDate, 
      exp.endDate || null, 
      exp.isCurrent ? 1 : 0,
      achievementsJson, 
      badgesJson, 
      exp.logoUrl || '', 
      exp.orderIndex || 0,
      parseInt(id, 10)
    ).run();

    return c.json({ success: true, message: 'Experience updated successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to update experience' }, 500);
  }
});

app.delete('/api/admin/experience/:id', async (c) => {
  try {
    const id = c.req.param('id');

    await c.env.DB.prepare(
      `DELETE FROM work_experience WHERE id = ?`
    ).bind(parseInt(id, 10)).run();

    return c.json({ success: true, message: 'Experience deleted successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to delete experience' }, 500);
  }
});

app.post('/api/admin/experience/reorder', async (c) => {
  try {
    const { ids } = await c.req.json();
    if (!Array.isArray(ids) || ids.some((id) => !Number.isInteger(id))) {
      return c.json({ error: 'A numeric ids array is required' }, 400);
    }

    await reorderByIds(c, 'work_experience', ids);
    return c.json({ success: true, message: 'Experience order updated successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to reorder experience' }, 500);
  }
});

// Skills admin routes
app.post('/api/admin/skills', async (c) => {
  try {
    const skill = await c.req.json();
    
    // Validate required fields
    if (!skill.name) {
      return c.json({ error: 'Skill name is required' }, 400);
    }

    const stmt = c.env.DB.prepare(
      `INSERT INTO skills 
        (name, category, order_index) 
       VALUES 
        (?, ?, ?)`
    );

    await stmt.bind(
      skill.name, 
      skill.category || '', 
      skill.orderIndex || 0
    ).run();

    return c.json({ success: true, message: 'Skill created successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to create skill' }, 500);
  }
});

app.put('/api/admin/skills/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const skill = await c.req.json();

    const stmt = c.env.DB.prepare(
      `UPDATE skills SET 
        name = ?, category = ?, order_index = ?
       WHERE id = ?`
    );

    await stmt.bind(
      skill.name, 
      skill.category || '', 
      skill.orderIndex || 0,
      parseInt(id, 10)
    ).run();

    return c.json({ success: true, message: 'Skill updated successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to update skill' }, 500);
  }
});

app.delete('/api/admin/skills/:id', async (c) => {
  try {
    const id = c.req.param('id');

    await c.env.DB.prepare(
      `DELETE FROM skills WHERE id = ?`
    ).bind(parseInt(id, 10)).run();

    return c.json({ success: true, message: 'Skill deleted successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to delete skill' }, 500);
  }
});

app.post('/api/admin/skills/reorder', async (c) => {
  try {
    const { ids } = await c.req.json();
    if (!Array.isArray(ids) || ids.some((id) => !Number.isInteger(id))) {
      return c.json({ error: 'A numeric ids array is required' }, 400);
    }

    await reorderByIds(c, 'skills', ids);
    return c.json({ success: true, message: 'Skill order updated successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to reorder skills' }, 500);
  }
});

// Education admin routes
app.post('/api/admin/education', async (c) => {
  try {
    const edu = await c.req.json();
    
    if (!edu.school || !edu.degree) {
      return c.json({ error: 'School and degree are required' }, 400);
    }

    const stmt = c.env.DB.prepare(
      `INSERT INTO education (school, degree, start_year, end_year, order_index) 
       VALUES (?, ?, ?, ?, ?)`
    );

    await stmt.bind(
      edu.school,
      edu.degree,
      edu.startYear || '',
      edu.endYear || '',
      edu.orderIndex || 0
    ).run();

    return c.json({ success: true, message: 'Education created successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to create education' }, 500);
  }
});

app.put('/api/admin/education/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const edu = await c.req.json();

    const stmt = c.env.DB.prepare(
      `UPDATE education SET school = ?, degree = ?, start_year = ?, end_year = ?, order_index = ?
       WHERE id = ?`
    );

    await stmt.bind(
      edu.school,
      edu.degree,
      edu.startYear || '',
      edu.endYear || '',
      edu.orderIndex || 0,
      parseInt(id, 10)
    ).run();

    return c.json({ success: true, message: 'Education updated successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to update education' }, 500);
  }
});

app.delete('/api/admin/education/:id', async (c) => {
  try {
    const id = c.req.param('id');

    await c.env.DB.prepare(
      `DELETE FROM education WHERE id = ?`
    ).bind(parseInt(id, 10)).run();

    return c.json({ success: true, message: 'Education deleted successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to delete education' }, 500);
  }
});

app.post('/api/admin/education/reorder', async (c) => {
  try {
    const { ids } = await c.req.json();
    if (!Array.isArray(ids) || ids.some((id) => !Number.isInteger(id))) {
      return c.json({ error: 'A numeric ids array is required' }, 400);
    }

    await reorderByIds(c, 'education', ids);
    return c.json({ success: true, message: 'Education order updated successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to reorder education' }, 500);
  }
});

// Upload admin route
app.post('/api/admin/upload', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File | null;
    const path = formData.get('path') as string | null;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    if (!path) {
      return c.json({ error: 'No path provided' }, 400);
    }

    if (path === 'certifications') {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) {
        return c.json({ error: 'Only PDF files are allowed for certifications' }, 400);
      }
    }

    // Generate a unique filename to prevent conflicts
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const fileName = `${path}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;
    
    // Upload to R2 with long cache (filenames are unique/immutable)
    const isPdf = extension === 'pdf';
    await c.env.STORAGE.put(fileName, file.stream(), {
      httpMetadata: {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000, immutable',
        contentDisposition: isPdf ? 'inline' : undefined
      }
    });

    // Return the public URL
    const publicUrl = `${c.env.ASSETS_URL}/${fileName}`;
    return c.json({ url: publicUrl });
  } catch (error) {
    return c.json({ error: 'Failed to upload file' }, 500);
  }
});

// Health check route for Status Page (Official Cloudflare Data)
app.get('/api/admin/health', async (c) => {
  try {
    // Fetch official summary from Cloudflare Status Page with User-Agent
    const cfStatusResponse = await fetch('https://www.cloudflarestatus.com/api/v2/summary.json', {
      headers: { 'User-Agent': 'Portfolio-Status-Page/1.0' }
    });
    
    if (!cfStatusResponse.ok) {
      throw new Error(`Cloudflare API responded with ${cfStatusResponse.status}`);
    }

    const cfData = await cfStatusResponse.json() as any;

    // Mapping relevant services to their official names or keywords
    const mapping = {
      'Workers': 'Workers',
      'D1': 'D1',
      'R2': 'R2',
      'Pages': 'Pages'
    };

    const componentStatus: Record<string, string> = {};
    
    cfData.components.forEach((comp: any) => {
      // Look for our keywords in the official component names
      Object.entries(mapping).forEach(([key, keyword]) => {
        if (comp.name.includes(keyword) && !comp.name.includes('Edge')) {
          componentStatus[key] = comp.status === 'operational' ? 'operational' : 'degraded';
        }
      });
    });

    // If some components are missing, provide default
    ['Workers', 'D1', 'R2', 'Pages'].forEach(key => {
      if (!componentStatus[key]) componentStatus[key] = 'operational';
    });

    return c.json({
      official: cfData.status.description,
      indicator: cfData.status.indicator,
      components: componentStatus
    });
  } catch (error: any) {
    console.error('CF Status Fetch Error:', error);
    return c.json({ 
      error: 'Failed to fetch official status', 
      details: error.message 
    }, 500);
  }
});

// Deploy hook route
app.post('/api/admin/deploy', async (c) => {
  try {
    const deployHookUrl = c.env.PAGES_DEPLOY_HOOK_URL;
    
    if (!deployHookUrl) {
      return c.json({ error: 'Deploy hook URL not configured' }, 500);
    }

    // Trigger the deploy hook
    const response = await fetch(deployHookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Deploy hook failed with status ${response.status}`);
    }

    return c.json({ success: true, message: 'Deploy triggered successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to trigger deploy' }, 500);
  }
});

export default app;
