-- database.sql - 戒菸教育系統資料庫結構

-- 學生基本資料表
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    class VARCHAR(100) NOT NULL,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    phone VARCHAR(10) NOT NULL,
    instructor VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'in_progress',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 吸菸調查資料表
CREATE TABLE IF NOT EXISTS smoking_surveys (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(20) REFERENCES students(student_id) ON DELETE CASCADE,
    start_smoking VARCHAR(20) NOT NULL,
    frequency VARCHAR(30) NOT NULL,
    daily_amount VARCHAR(20) NOT NULL,
    reasons TEXT[], -- PostgreSQL 陣列類型
    family_smoking VARCHAR(10) NOT NULL,
    campus_awareness VARCHAR(10) NOT NULL,
    signage_awareness VARCHAR(10) NOT NULL,
    tobacco_type VARCHAR(20) NOT NULL,
    quit_attempts VARCHAR(10) NOT NULL,
    quit_intention VARCHAR(10) NOT NULL,
    counseling_interest VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 影片觀看記錄表
CREATE TABLE IF NOT EXISTS video_records (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(20) REFERENCES students(student_id) ON DELETE CASCADE,
    video_1_time INTEGER DEFAULT 0,
    video_2_time INTEGER DEFAULT 0,
    video_3_time INTEGER DEFAULT 0,
    video_4_time INTEGER DEFAULT 0,
    total_time INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 測驗結果表
CREATE TABLE IF NOT EXISTS quiz_results (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(20) REFERENCES students(student_id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL,
    user_answer TEXT,
    correct_answer TEXT,
    is_correct BOOLEAN NOT NULL,
    attempt_number INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 測驗完成記錄表
CREATE TABLE IF NOT EXISTS quiz_completions (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(20) REFERENCES students(student_id) ON DELETE CASCADE,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    score_percentage DECIMAL(5,2) NOT NULL,
    attempts INTEGER DEFAULT 1,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 心得寫作記錄表
CREATE TABLE IF NOT EXISTS essay_records (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(20) REFERENCES students(student_id) ON DELETE CASCADE,
    essay_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 活動場次選擇表
CREATE TABLE IF NOT EXISTS event_selections (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(20) REFERENCES students(student_id) ON DELETE CASCADE,
    selected_date VARCHAR(50) NOT NULL,
    event_attended BOOLEAN DEFAULT FALSE,
    selected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 系統完成記錄表
CREATE TABLE IF NOT EXISTS completion_records (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(20) REFERENCES students(student_id) ON DELETE CASCADE,
    personal_info_completed BOOLEAN DEFAULT FALSE,
    survey_completed BOOLEAN DEFAULT FALSE,
    videos_completed BOOLEAN DEFAULT FALSE,
    quiz_completed BOOLEAN DEFAULT FALSE,
    essay_completed BOOLEAN DEFAULT FALSE,
    event_selected BOOLEAN DEFAULT FALSE,
    all_completed BOOLEAN DEFAULT FALSE,
    completion_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 管理員帳號表
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    email VARCHAR(100),
    role VARCHAR(20) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 系統日誌表
CREATE TABLE IF NOT EXISTS system_logs (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(20),
    action VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 索引建立
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_instructor ON students(instructor);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_created_at ON students(created_at);

CREATE INDEX IF NOT EXISTS idx_smoking_surveys_student_id ON smoking_surveys(student_id);
CREATE INDEX IF NOT EXISTS idx_video_records_student_id ON video_records(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_student_id ON quiz_results(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_completions_student_id ON quiz_completions(student_id);
CREATE INDEX IF NOT EXISTS idx_essay_records_student_id ON essay_records(student_id);
CREATE INDEX IF NOT EXISTS idx_event_selections_student_id ON event_selections(student_id);
CREATE INDEX IF NOT EXISTS idx_completion_records_student_id ON completion_records(student_id);

-- 觸發器：自動更新 updated_at 欄位
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 為需要的表格創建觸發器
CREATE TRIGGER update_students_updated_at 
    BEFORE UPDATE ON students 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_completion_records_updated_at 
    BEFORE UPDATE ON completion_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入預設管理員帳號（密碼：admin123，實際使用時應該加密）
INSERT INTO admin_users (username, password_hash, full_name, role) 
VALUES ('admin', '$2b$10$rQ7q5J5zGjG5J5zGjG5J5u', '系統管理員', 'admin')
ON CONFLICT (username) DO NOTHING;

-- 插入測試資料（可選）
INSERT INTO students (name, class, student_id, phone, instructor, status) VALUES
('張小明', '資工系二甲', 'A123456789', '0912345678', '郭威均教官', 'completed'),
('李小華', '企管系一乙', 'B987654321', '0987654321', '陳鈴玉教官', 'in_progress'),
('王小美', '護理系三甲', 'C456789123', '0923456789', '許順益教官', 'completed')
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO smoking_surveys (student_id, start_smoking, frequency, daily_amount, reasons, family_smoking, campus_awareness, signage_awareness, tobacco_type, quit_attempts, quit_intention, counseling_interest) VALUES
('A123456789', '高中階段', '每天抽', '5-9支', '{"放鬆","習慣"}', '有', '知道', '有', '紙煙', '有', '有', '有'),
('B987654321', '大學以後', '1-2天抽1次', '1-2支', '{"交際","打發時間"}', '沒有', '知道', '有', '電子煙', '沒有', '有', '有'),
('C456789123', '國中階段', '3-4天抽1次', '3-4支', '{"專心","放鬆"}', '有', '知道', '沒有', '紙煙', '有', '有', '有')
ON CONFLICT DO NOTHING;

-- 建立視圖：完整學生資料
CREATE OR REPLACE VIEW student_complete_info AS
SELECT 
    s.*,
    ss.start_smoking,
    ss.frequency,
    ss.daily_amount,
    ss.reasons,
    ss.family_smoking,
    ss.campus_awareness,
    ss.signage_awareness,
    ss.tobacco_type,
    ss.quit_attempts,
    ss.quit_intention,
    ss.counseling_interest,
    vr.total_time as video_watch_time,
    qc.score_percentage,
    qc.attempts as quiz_attempts,
    es.selected_date as event_date,
    cr.all_completed,
    cr.completion_date
FROM students s
LEFT JOIN smoking_surveys ss ON s.student_id = ss.student_id
LEFT JOIN video_records vr ON s.student_id = vr.student_id
LEFT JOIN quiz_completions qc ON s.student_id = qc.student_id
LEFT JOIN event_selections es ON s.student_id = es.student_id
LEFT JOIN completion_records cr ON s.student_id = cr.student_id;

COMMENT ON TABLE students IS '學生基本資料表';
COMMENT ON TABLE smoking_surveys IS '吸菸狀況調查表';
COMMENT ON TABLE video_records IS '影片觀看記錄表';
COMMENT ON TABLE quiz_results IS '測驗答題記錄表';
COMMENT ON TABLE quiz_completions IS '測驗完成統計表';
COMMENT ON TABLE essay_records IS '心得寫作記錄表';
COMMENT ON TABLE event_selections IS '活動場次選擇表';
COMMENT ON TABLE completion_records IS '系統完成進度記錄表';
COMMENT ON TABLE admin_users IS '管理員帳號表';
COMMENT ON TABLE system_logs IS '系統操作日誌表';

-- 提交記錄表 (API 使用)
CREATE TABLE IF NOT EXISTS submissions (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    student_id TEXT,
    title TEXT,
    score NUMERIC,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE submissions IS '通用提交記錄表 (用於儲存問卷與其他表單資料)';
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON submissions(student_id);

