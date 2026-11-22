INSERT INTO project_categories (name, slug, sort_order) VALUES
('Websites', 'websites', 1),
('Business Management Systems', 'business-systems', 2),
('Desktop Applications', 'desktop-applications', 3),
('Mobile Applications', 'mobile-applications', 4),
('Database and API Projects', 'database-api', 5),
('Other Digital Solutions', 'other', 6)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (title, description, sort_order)
SELECT * FROM (VALUES
('Website Development', 'Business, corporate, e-commerce and school websites built to convert visitors into clients.', 1),
('Business Software', 'POS, inventory, pharmacy and management systems tailored to how your business runs.', 2),
('Desktop Applications', 'Windows applications and offline software with reliable local data storage.', 3),
('Mobile Applications', 'Business mobile applications and dashboards for work on the move.', 4),
('API Development', 'Secure backend services and system integrations.', 5),
('Website Maintenance', 'Hosting, updates, backups and ongoing technical support.', 6)
) AS v(title, description, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM services);

INSERT INTO skills (category, name, sort_order)
SELECT * FROM (VALUES
('Frontend', 'HTML5', 1), ('Frontend', 'CSS3', 2), ('Frontend', 'JavaScript', 3),
('Backend', 'PHP', 1), ('Backend', 'C#', 2),
('Database', 'MySQL', 1), ('Database', 'SQLite', 2), ('Database', 'PostgreSQL', 3),
('Tools', 'GitHub', 1), ('Tools', 'Visual Studio', 2), ('Tools', 'VS Code', 3),
('Tools', 'XAMPP', 4), ('Tools', 'Railway', 5), ('Tools', 'Vercel', 6), ('Tools', 'Supabase', 7)
) AS v(category, name, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM skills);

INSERT INTO projects (category_id, title, slug, summary, description, features, technologies, status, is_featured, is_published)
SELECT c.id, v.title, v.slug, v.summary, v.description, v.features, v.technologies, v.status, v.is_featured, TRUE
FROM (VALUES
('business-systems', 'Azumah Enterprise POS', 'azumah-enterprise-pos', 'Point of sale and stock control for a retail business.', 'Placeholder description. Replace with an accurate account of the system.', E'Sales processing\nStock control\nReceipts\nDaily reports', 'PHP, MySQL, JavaScript', 'completed', TRUE),
('business-systems', 'BARLINK', 'barlink', 'Bar management software for orders, stock and staff sales.', 'Placeholder description. Replace with an accurate account of the system.', E'Order tracking\nStock levels\nSales reports', 'PHP, MySQL', 'completed', TRUE),
('business-systems', 'Pharmacy Management System', 'pharmacy-management-system', 'Inventory, expiry tracking and sales for pharmacies.', 'Placeholder description. Replace with an accurate account of the system.', E'Drug inventory\nExpiry alerts\nSales records', 'PHP, MySQL', 'completed', TRUE),
('business-systems', 'Hospital Management System', 'hospital-management-system', 'Patient records, appointments and billing.', 'Placeholder description. Replace with an accurate account of the system.', E'Patient records\nAppointments\nBilling', 'PHP, MySQL', 'ongoing', FALSE),
('websites', 'Great Step Academy Portal', 'great-step-academy-portal', 'School portal for information and student administration.', 'Placeholder description. Replace with an accurate account of the system.', E'Student records\nAnnouncements\nResults', 'PHP, MySQL, JavaScript', 'completed', FALSE),
('websites', 'Matts Woven Crafts and Arts', 'matts-woven-crafts-arts', 'E-commerce website for handcrafted woven products.', 'Placeholder description. Replace with an accurate account of the website.', E'Product catalogue\nOrder enquiries\nResponsive design', 'HTML5, CSS3, JavaScript, PHP', 'completed', FALSE),
('websites', 'CABOBO Installation', 'cabobo-installation', 'Business website for an installation company.', 'Placeholder description. Replace with an accurate account of the website.', E'Service pages\nQuote requests\nResponsive design', 'HTML5, CSS3, JavaScript', 'completed', FALSE)
) AS v(cat, title, slug, summary, description, features, technologies, status, is_featured)
JOIN project_categories c ON c.slug = v.cat
ON CONFLICT (slug) DO NOTHING;

INSERT INTO profiles (id, full_name, headline, tagline, bio, background, philosophy, career_goals) VALUES
(1, 'John Nsoh', 'Full-Stack Web Developer | Business Software Developer', 'Turning Ideas Into Powerful Digital Solutions.',
 'Placeholder biography. Describe who you are and the kinds of systems you build.',
 'Placeholder. Describe your professional background and technical experience.',
 'Placeholder. Describe how you approach building reliable, secure software.',
 'Placeholder. Describe your career objectives.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO blog_categories (name, slug) VALUES
('Website Development', 'website-development'),
('Business Software', 'business-software'),
('Web Tutorials', 'web-tutorials'),
('Database Management', 'database-management'),
('Technology Tips', 'technology-tips')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO site_settings (setting_key, setting_value) VALUES
('whatsapp', ''), ('phone', ''), ('email', ''), ('linkedin', ''), ('github', ''),
('notify_email', ''), ('cv_url', ''), ('site_title', 'John Nsoh | Web & Software Developer'),
('site_description', 'John Nsoh is a web and software developer specialising in modern websites, business management systems, custom applications and digital solutions.')
ON CONFLICT (setting_key) DO NOTHING;
