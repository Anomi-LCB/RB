-- 성경 읽기 계획 테이블
CREATE TABLE reading_plan (
  id SERIAL PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  title TEXT NOT NULL,
  verses JSONB NOT NULL,
  day_of_year INTEGER NOT NULL,
  category TEXT,
  summary TEXT,
  reading_time TEXT
);

-- 사용자별 진행 상황 테이블
CREATE TABLE user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id INTEGER REFERENCES reading_plan(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT TRUE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, plan_id)
);

-- RLS (Row Level Security) 설정
ALTER TABLE reading_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- 누구나 읽기 계획을 볼 수 있도록 설정
CREATE POLICY "Allow public read access to reading_plan" 
ON reading_plan FOR SELECT USING (true);

-- 자신의 진행 상황만 보고 수정할 수 있도록 설정
CREATE POLICY "Allow individual read access to progress" 
ON user_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow individual insert access to progress" 
ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow individual update access to progress" 
ON user_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow individual delete access to progress" 
ON user_progress FOR DELETE USING (auth.uid() = user_id);
