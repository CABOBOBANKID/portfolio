CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(60) NOT NULL UNIQUE,
    email VARCHAR(190) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    category_id INT NOT NULL REFERENCES project_categories(id) ON DELETE RESTRICT,
    title VARCHAR(160) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    summary VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    features TEXT,
    technologies VARCHAR(400),
    status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'ongoing', 'maintenance')),
    completed_on DATE,
    live_url VARCHAR(300),
    github_url VARCHAR(300),
    featured_image TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_projects_published ON projects (is_published, is_featured);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects (category_id);

CREATE TABLE IF NOT EXISTS project_images (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    caption VARCHAR(200),
    sort_order INT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_images_project ON project_images (project_id);

CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    title VARCHAR(120) NOT NULL,
    description VARCHAR(400) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    category VARCHAR(80) NOT NULL,
    name VARCHAR(80) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills (category);

CREATE TABLE IF NOT EXISTS enquiries (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL,
    phone VARCHAR(30),
    company VARCHAR(150),
    project_type VARCHAR(80) NOT NULL,
    budget_range VARCHAR(60),
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
    ip_hash CHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries (status, created_at);

CREATE TABLE IF NOT EXISTS rate_limits (
    id BIGSERIAL PRIMARY KEY,
    bucket VARCHAR(60) NOT NULL,
    ip_hash CHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_rate_lookup ON rate_limits (bucket, ip_hash, created_at);

CREATE TABLE IF NOT EXISTS site_settings (
    setting_key VARCHAR(60) PRIMARY KEY,
    setting_value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS profiles (
    id SMALLINT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    headline VARCHAR(200) NOT NULL,
    tagline VARCHAR(200) NOT NULL,
    bio TEXT NOT NULL,
    background TEXT,
    philosophy TEXT,
    career_goals TEXT,
    photo TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    client_name VARCHAR(120) NOT NULL,
    business_name VARCHAR(150),
    quote TEXT NOT NULL,
    project_id INT REFERENCES projects(id) ON DELETE SET NULL,
    photo TEXT,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_testimonials_published ON testimonials (is_published);

CREATE TABLE IF NOT EXISTS blog_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS blog_posts (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES blog_categories(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,
    excerpt VARCHAR(300) NOT NULL,
    content TEXT NOT NULL,
    cover_image TEXT,
    seo_description VARCHAR(300),
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_posts_published ON blog_posts (is_published, published_at);

CREATE TABLE IF NOT EXISTS page_visits (
    id BIGSERIAL PRIMARY KEY,
    path VARCHAR(200) NOT NULL,
    ip_hash CHAR(64) NOT NULL,
    visited_on DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_visits_day ON page_visits (visited_on);
CREATE INDEX IF NOT EXISTS idx_visits_path ON page_visits (path);

CREATE TABLE IF NOT EXISTS media (
    id SERIAL PRIMARY KEY,
    file_name TEXT NOT NULL,
    original_name VARCHAR(200) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
