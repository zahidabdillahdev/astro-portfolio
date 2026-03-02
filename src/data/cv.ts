export interface CV {
    name: string,
    title: string,
    location: string,
    locationLink: string,
    about: string,
    summary: string,
    personalWebsiteUrl: string,
    contact: Contact;
    work: Work[];
    education: Education[];
    skills: string[];
    projects?: Project[];
    certifications?: Certification[];
}

export interface Contact {
    email: string,
    tel: string,
    social: Social[];
    resumeUrl?: string;
    instagramUrl?: string;
}

export interface Social {
    name: string;
    url: string;
}

export interface Work {
    company: string;
    link: string;
    title: string;
    start: string;
    end: string | null;
    description: string;
    achievements?: string[];
    badges?: string[];
    logoUrl?: string;
}

export interface Education {
    school: string;
    degree: string;
    start: string;
    end: string | null;
}

export interface Project {
    title: string; 
    slug: string; 
    description: string; 
    category: string;
    client?: string; 
    thumbnailUrl?: string;
    linkType: 'notion' | 'gdrive' | 'pdf' | 'url'; 
    linkUrl: string;
    results?: Record<string, string>; 
    tags?: string[];
    isFeatured?: boolean; 
    orderIndex?: number;
}

export interface Certification {
    title: string; 
    issuer: string; 
    issueDate: string; 
    expiryDate?: string;
    credentialId?: string; 
    credentialUrl?: string;
    certificateUrl?: string; 
    thumbnailUrl?: string; 
    orderIndex?: number;
}

export const CV_DATA: CV = {
    name: "Zahid Abdillah",
    title: "Digital Marketing Specialist",
    location: "Jakarta, Indonesia",
    locationLink: "https://www.google.com/maps/place/Jakarta",
    about: "Results-driven Digital Marketing Specialist with expertise in building high-quality marketing campaigns and online presence.",
    summary: `A Digital Marketing Specialist specializing in developing high-performance, scalable marketing strategies using various digital channels. 
        I have extensive experience building and managing campaigns for complex projects in e-commerce, SaaS, and retail industries.`,
    personalWebsiteUrl: "https://zahidabdillah.dev",
    contact: {
        email: "muhammadzahidabdillah@gmail.com",
        tel: "+6281234567890",
        resumeUrl: "https://assets.zahidabdillah.dev/documents/zahid-resume.pdf",
        instagramUrl: "https://instagram.com/zahidabdillah",
        social: [
            {name: "GitHub", url: "https://github.com/zahidabdillah"},
            {name: "LinkedIn", url: "https://linkedin.com/in/zahidabdillah"},
        ],
    },
    work: [
        {
            company: "PT Digital Sukses",
            link: "https://www.ptdigitalsukses.com/",
            title: "Senior Digital Marketing Manager",
            start: "Jan 2022",
            end: "Present",
            description: "Lead digital marketing initiatives for multiple product lines, focusing on growth and customer acquisition.",
            achievements: [
                "Increased organic traffic by 150% through SEO optimization and content strategy.",
                "Managed paid advertising budget of $50K/month, achieving 4x ROI.",
                "Launched successful influencer marketing program, resulting in 25% brand awareness increase.",
                "Developed data-driven marketing strategies using Google Analytics and Facebook Ads Manager.",
                "Led cross-functional team of 5 marketing specialists to execute integrated campaigns."
            ],
            badges: ["SEO", "Google Ads", "Facebook Ads", "Analytics", "Marketing Automation", "Content Strategy", "Email Marketing", "Influencer Marketing"],
            logoUrl: "https://assets.zahidabdillah.dev/logos/pt-digital-sukses.png",
        },
        {
            company: "MarketGrowth Solutions",
            link: "https://www.marketgrowth.com/",
            title: "Digital Marketing Specialist",
            start: "Jun 2020",
            end: "Dec 2021",
            description: "Executed digital marketing campaigns across multiple channels to drive lead generation and conversion.",
            achievements: [
                "Optimized landing pages resulting in 40% improvement in conversion rates.",
                "Managed social media accounts with combined reach of 100K+ followers.",
                "Created and executed email marketing campaigns with 25% open rate.",
                "Collaborated with sales team to improve lead quality and conversion pipeline.",
                "Analyzed campaign performance and provided actionable insights for optimization."
            ],
            badges: ["Social Media Marketing", "Email Marketing", "PPC Advertising", "Conversion Optimization", "A/B Testing", "CRM", "Sales Funnel"],
            logoUrl: "https://assets.zahidabdillah.dev/logos/marketgrowth-solutions.png",
        },
        {
            company: "Creative Digital Agency",
            link: "https://www.creativedigitalagency.com/",
            title: "Marketing Associate",
            start: "Mar 2018",
            end: "May 2020",
            description: "Supported senior marketers in developing and implementing digital marketing strategies for diverse client portfolio.",
            achievements: [
                "Assisted in managing campaigns for 15+ clients across various industries.",
                "Created engaging content for social media platforms, increasing engagement by 60%.",
                "Monitored and reported on campaign performance using various analytics tools.",
                "Coordinated with design team to create compelling visual assets for campaigns.",
                "Participated in brainstorming sessions for innovative marketing approaches."
            ],
            badges: ["Content Creation", "Social Media Management", "Campaign Analysis", "Client Relations", "Brand Development"],
            logoUrl: "https://assets.zahidabdillah.dev/logos/creative-digital-agency.png",
        }
    ],
    education: [
        {
            school: "University of Indonesia",
            degree: "Master's degree, Digital Marketing",
            start: "2016",
            end: "2018",
        },
        {
            school: "Bandung Institute of Technology",
            degree: "Bachelor's degree, Business Administration",
            start: "2012",
            end: "2016",
        },
    ],
    skills: [
        "Digital Marketing", "SEO/SEM", "Social Media Marketing", "Content Marketing", 
        "Email Marketing", "PPC Advertising", "Google Analytics", "Facebook Ads", 
        "Instagram Marketing", "LinkedIn Marketing", "Marketing Automation", 
        "Conversion Rate Optimization", "A/B Testing", "Brand Management", 
        "Customer Acquisition", "Data Analysis", "Campaign Management"
    ],
    projects: [
        {
            title: "E-commerce Conversion Optimization",
            slug: "ecommerce-conversion-optimization",
            description: "Improved conversion rates for fashion e-commerce platform through A/B testing and UX optimization.",
            category: "Conversion Optimization",
            client: "Fashion Forward",
            thumbnailUrl: "https://assets.zahidabdillah.dev/projects/fashion-forward-thumb.jpg",
            linkType: "url",
            linkUrl: "https://fashionforward.com",
            results: {
                "Conversion Rate": "Increased by 35%",
                "Revenue": "Increased by $2.3M annually",
                "ROI": "4.2x"
            },
            tags: ["A/B Testing", "UX Optimization", "E-commerce", "Analytics"],
            isFeatured: true,
            orderIndex: 1
        },
        {
            title: "Social Media Growth Campaign",
            slug: "social-media-growth-campaign",
            description: "Developed and executed social media strategy that grew audience from 10K to 100K followers in 6 months.",
            category: "Social Media Marketing",
            client: "TechStart Inc.",
            thumbnailUrl: "https://assets.zahidabdillah.dev/projects/techstart-thumb.jpg",
            linkType: "url",
            linkUrl: "https://techstart.com",
            results: {
                "Followers": "Increased from 10K to 100K",
                "Engagement": "Increased by 180%",
                "Brand Awareness": "Increased by 65%"
            },
            tags: ["Social Media", "Content Strategy", "Community Building", "Influencer Marketing"],
            isFeatured: true,
            orderIndex: 2
        },
        {
            title: "SEO Strategy for SaaS Company",
            slug: "seo-strategy-saas-company",
            description: "Comprehensive SEO strategy that increased organic traffic by 200% for B2B SaaS platform.",
            category: "SEO",
            client: "CloudSoft Solutions",
            thumbnailUrl: "https://assets.zahidabdillah.dev/projects/cloudsoft-thumb.jpg",
            linkType: "url",
            linkUrl: "https://cloudsoft.com",
            results: {
                "Organic Traffic": "Increased by 200%",
                "Keyword Rankings": "Top 3 for 45 keywords",
                "Leads": "Increased by 150%"
            },
            tags: ["SEO", "Content Marketing", "Technical SEO", "Link Building"],
            isFeatured: false,
            orderIndex: 3
        }
    ],
    certifications: [
        {
            title: "Google Ads Certified Professional",
            issuer: "Google",
            issueDate: "2023-01-15",
            expiryDate: "2024-01-15",
            credentialId: "AD-123456789",
            credentialUrl: "https://certificate.google.com/adwords/123456789",
            certificateUrl: "https://assets.zahidabdillah.dev/certificates/google-ads-cert.pdf",
            thumbnailUrl: "https://assets.zahidabdillah.dev/certificates/google-ads-thumb.jpg",
            orderIndex: 1
        },
        {
            title: "Facebook Blueprint Certification",
            issuer: "Meta",
            issueDate: "2022-11-20",
            expiryDate: "2023-11-20",
            credentialId: "FB-987654321",
            credentialUrl: "https://certificate.facebook.com/blueprint/987654321",
            certificateUrl: "https://assets.zahidabdillah.dev/certificates/facebook-blueprint-cert.pdf",
            thumbnailUrl: "https://assets.zahidabdillah.dev/certificates/facebook-blueprint-thumb.jpg",
            orderIndex: 2
        },
        {
            title: "Google Analytics Individual Qualification",
            issuer: "Google",
            issueDate: "2022-08-10",
            expiryDate: "2023-08-10",
            credentialId: "GA-456789123",
            credentialUrl: "https://certificate.google.com/analytics/456789123",
            certificateUrl: "https://assets.zahidabdillah.dev/certificates/google-analytics-cert.pdf",
            thumbnailUrl: "https://assets.zahidabdillah.dev/certificates/google-analytics-thumb.jpg",
            orderIndex: 3
        }
    ]
};