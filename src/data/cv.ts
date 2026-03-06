export interface CV {
    name: string,
    title: string,
    location: string,
    locationLink: string | null,
    about: string,
    summary: string,
    avatarUrl?: string,
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
    name: "",
    title: "",
    location: "",
    locationLink: "",
    about: "",
    summary: "",
    avatarUrl: "",
    personalWebsiteUrl: "",
    contact: {
        email: "",
        tel: "",
        resumeUrl: "",
        social: [],
    },
    work: [],
    education: [],
    skills: [],
    projects: [],
    certifications: []
};
