CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS members (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT NOT NULL, area TEXT DEFAULT '', activity TEXT DEFAULT '', message TEXT DEFAULT '', status TEXT DEFAULT 'pending', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT DEFAULT '', date TEXT DEFAULT '', location TEXT DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS meetings (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, day TEXT DEFAULT '', time TEXT DEFAULT '', location TEXT DEFAULT '', details TEXT DEFAULT '');
CREATE TABLE IF NOT EXISTS bureau (id INTEGER PRIMARY KEY AUTOINCREMENT, role TEXT NOT NULL, name TEXT DEFAULT '', photo TEXT DEFAULT '', sort_order INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS gallery (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT DEFAULT '', image_url TEXT NOT NULL, description TEXT DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS admin (id INTEGER PRIMARY KEY CHECK(id=1), password_hash TEXT NOT NULL, salt TEXT NOT NULL, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_members_created ON members(created_at);
CREATE INDEX IF NOT EXISTS idx_bureau_order ON bureau(sort_order);
INSERT OR IGNORE INTO settings(key,value) VALUES
('site_name','TAI EE KI Moundang'),
('city','Bonabéri / Douala, Cameroun'),
('phone','+237 675 19 82 09'),
('whatsapp','+237675198209'),
('hero_eyebrow','BONABÉRI • DOUALA'),
('hero_title','Unis par nos origines,<br><span>forts par notre solidarité.</span>'),
('hero_lead','TAI EE KI Moundang rassemble les Moundang de Bonabéri et de Douala pour favoriser la rencontre, l’échange, le partage, la solidarité et la transmission aux jeunes générations.'),
('association_title','Une communauté réunie autour de valeurs communes'),
('association_p1','TAI EE KI Moundang a vocation à créer un espace de rencontre et de fraternité entre les membres de la communauté Moundang vivant à Bonabéri et plus largement à Douala.'),
('association_p2','L’association encourage les échanges, le partage d’expériences et l’entraide, tout en accordant une place importante à la jeunesse et à la transmission de l’identité Moundang.'),
('culture_title','Culture & patrimoine Moundang'),
('culture_text','Cette rubrique pourra présenter progressivement l’histoire, la langue, les traditions, les coutumes, les personnalités et le patrimoine Moundang.'),
('youth_title','La jeunesse au cœur de la transmission'),
('contact_intro','Pour toute question, information ou prise de contact avec l’association, vous pouvez joindre le secrétaire sur le numéro officiel de contact.'),
('logo','');
INSERT OR IGNORE INTO meetings(title,day,time,location,details) VALUES
('Réunion ordinaire','À préciser','À préciser','À préciser',''),
('Réunion du bureau','À préciser','À préciser','À préciser',''),
('Assemblée générale','À préciser','À préciser','À préciser','');
