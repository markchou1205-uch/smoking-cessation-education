-- 戒菸教育系統資料庫結構

-- 學生基本資料表
CREATE TABLE students_info (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    class VARCHAR(50) NOT NULL,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    instructor VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 吸菸調查結果表
CREATE TABLE smoking_survey (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(20) REFERENCES students_info(student_id),
    start_smoking VARCHAR(20) NOT NULL, -- 開始吸菸時期
    frequency VARCHAR(20) NOT NULL, -- 吸菸頻率
    daily_amount VARCHAR(20) NOT NULL, -- 每日吸菸量
    reasons TEXT[], -- 吸菸原因(可複選)
    family_smoking BOOLEAN NOT NULL, -- 家中有人吸菸
    campus_awareness BOOLEAN NOT NULL, -- 知道校園禁菸
    signage_awareness BOOLEAN NOT NULL, -- 看過禁菸標示
    tobacco_type VARCHAR(20) NOT NULL, -- 菸品類型
    quit_attempts BOOLEAN NOT NULL, -- 嘗試過戒菸
    quit_intention BOOLEAN NOT NULL, -- 戒菸意願
    counseling_interest BOOLEAN NOT NULL, -- 輔導興趣
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 影片收視記錄表
CREATE TABLE video_records (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(20) REFERENCES students_info(student_id),
    video_1_time INTEGER DEFAULT 0, -- 第一部影片觀看時間(秒)
    video_2_time INTEGER DEFAULT 0,
    video_3_time INTEGER DEFAULT 0,
    video_4_time INTEGER DEFAULT 0,
    total_time INTEGER DEFAULT 0,
    violations INTEGER DEFAULT 0, -- 違規次數
    focus_percentage DECIMAL(5,2) DEFAULT 0, -- 專注度百分比
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 測驗題目表
CREATE TABLE quiz_questions (
    id SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL,
    question_type VARCHAR(10) NOT NULL, -- 'true_false' 或 'multiple_choice'
    correct_answer VARCHAR(10) NOT NULL,
    options TEXT[], -- 選擇題選項
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 測驗結果表
CREATE TABLE quiz_results (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(20) REFERENCES students_info(student_id),
    question_id INTEGER REFERENCES quiz_questions(id),
    student_answer VARCHAR(10),
    is_correct BOOLEAN,
    attempt_number INTEGER DEFAULT 1,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 宣導場次選擇表
CREATE TABLE event_selection (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(20) REFERENCES students_info(student_id),
    selected_date DATE NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 完整記錄表 (用於追蹤整體進度)
CREATE TABLE completion_records (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(20) REFERENCES students_info(student_id),
    survey_completed BOOLEAN DEFAULT FALSE,
    videos_completed BOOLEAN DEFAULT FALSE,
    quiz_completed BOOLEAN DEFAULT FALSE,
    essay_completed BOOLEAN DEFAULT FALSE,
    event_selected BOOLEAN DEFAULT FALSE,
    final_completed BOOLEAN DEFAULT FALSE,
    completion_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入測驗題目
INSERT INTO quiz_questions (question_text, question_type, correct_answer, options) VALUES
-- 是非題
('電子煙比傳統紙菸更安全，可以幫助戒菸。', 'true_false', 'false', NULL),
('二手菸對不吸菸者的健康沒有影響。', 'true_false', 'false', NULL),
('菸草中含有超過7000種化學物質。', 'true_false', 'true', NULL),
('戒菸後肺功能永遠無法恢復。', 'true_false', 'false', NULL),
('校園內全面禁止吸菸。', 'true_false', 'true', NULL),
('加熱菸不含尼古丁，比較健康。', 'true_false', 'false', NULL),
('孕婦吸菸會影響胎兒健康。', 'true_false', 'true', NULL),
('只要意志力強就一定能成功戒菸。', 'true_false', 'false', NULL),
('菸害防制法禁止在大專院校內吸菸。', 'true_false', 'true', NULL),
('戒菸後體重增加是永久性的。', 'true_false', 'false', NULL),

-- 選擇題
('菸草中最主要的成癮物質是？', 'multiple_choice', 'B', ARRAY['A) 焦油', 'B) 尼古丁', 'C) 一氧化碳', 'D) 甲醛']),
('戒菸多久後肺功能開始改善？', 'multiple_choice', 'C', ARRAY['A) 1天', 'B) 1週', 'C) 2週', 'D) 1個月']),
('以下哪種不是政府提供的戒菸資源？', 'multiple_choice', 'D', ARRAY['A) 戒菸專線', 'B) 戒菸門診', 'C) 戒菸藥物', 'D) 電子煙']),
('菸害防制法規定幾歲以下禁止吸菸？', 'multiple_choice', 'C', ARRAY['A) 16歲', 'B) 18歲', 'C) 20歲', 'D) 21歲']),
('二手菸中含有多少種致癌物質？', 'multiple_choice', 'C', ARRAY['A) 50種以上', 'B) 70種以上', 'C) 90種以上', 'D) 100種以上']),
('戒菸後多久心臟病風險會降低一半？', 'multiple_choice', 'C', ARRAY['A) 3個月', 'B) 6個月', 'C) 1年', 'D) 2年']),
('以下哪個不是吸菸對外貌的影響？', 'multiple_choice', 'C', ARRAY['A) 皮膚老化', 'B) 牙齒變黃', 'C) 頭髮變白', 'D) 口臭']),
('台灣戒菸專線號碼是？', 'multiple_choice', 'A', ARRAY['A) 0800-636363', 'B) 0800-636636', 'C) 0800-363636', 'D) 0800-366363']),
('電子煙在台灣的法律地位是？', 'multiple_choice', 'B', ARRAY['A) 合法販售', 'B) 全面禁止', 'C) 限制販售', 'D) 僅限成人']),
('懷孕期間吸菸最可能導致胎兒？', 'multiple_choice', 'B', ARRAY['A) 體重過重', 'B) 體重不足', 'C) 身高過高', 'D) 頭圍過大']);

-- 建立索引
CREATE INDEX idx_students_student_id ON students_info(student_id);
CREATE INDEX idx_survey_student_id ON smoking_survey(student_id);
CREATE INDEX idx_video_student_id ON video_records(student_id);
CREATE INDEX idx_quiz_student_id ON quiz_results(student_id);
CREATE INDEX idx_completion_student_id ON completion_records(student_id); 
