-- Миграция: Добавить view_count в page_analytics и product_analytics
-- Запускать только если эти колонки ещё не существуют

-- Добавляем view_count в page_analytics (если нет)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'page_analytics' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE page_analytics ADD COLUMN view_count INTEGER DEFAULT 1;
    RAISE NOTICE 'Added view_count to page_analytics';
  ELSE
    RAISE NOTICE 'view_count already exists in page_analytics';
  END IF;
END $$;

-- Добавляем view_count в product_analytics (если нет)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'product_analytics' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE product_analytics ADD COLUMN view_count INTEGER DEFAULT 1;
    RAISE NOTICE 'Added view_count to product_analytics';
  ELSE
    RAISE NOTICE 'view_count already exists in product_analytics';
  END IF;
END $$;

-- Проверяем структуру таблиц после миграции
SELECT table_name, column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name IN ('page_analytics', 'product_analytics')
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;
