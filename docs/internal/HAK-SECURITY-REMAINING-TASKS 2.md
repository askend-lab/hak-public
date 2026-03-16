# HAK Public — Оставшиеся задачи по безопасности

Контекст: PR #504 (`fix/hak-public-security`) реализует 14 из 20 пунктов плана безопасности.
Оставшиеся 6 пунктов заблокированы — они требуют доступа к AWS, деплоя в prod или времени на мониторинг.

---

## 1. CSP: мониторинг и переключение на enforce (3.3, 3.4)

**Что:** Content-Security-Policy сейчас в режиме `Report-Only` — он логирует нарушения в консоль браузера, но ничего не блокирует. Нужно понаблюдать 1-2 недели и затем переключить на enforce.

**Почему:** CSP защищает от XSS-атак, ограничивая откуда браузер может загружать скрипты, стили, шрифты и т.д. Если сразу включить enforce без мониторинга — можно сломать легитимную функциональность (например, забытый внешний ресурс).

**Как делать:**
1. Задеплоить PR #504 в prod
2. Открыть prod в Chrome DevTools → Console. Искать сообщения `[Report Only]` — это CSP violations
3. Если есть violations для легитимных ресурсов — добавить домен в соответствующую директиву в `packages/frontend/index.html`
4. Через 1-2 недели без ложных violations — заменить `Content-Security-Policy-Report-Only` на `Content-Security-Policy` в `index.html`

**Файл:** `packages/frontend/index.html` (строка с `<meta http-equiv="Content-Security-Policy-Report-Only">`)

---

## 2. AWS WAF (4.1–4.4)

**Что:** Создать AWS WAF Web ACL и привязать к API Gateway для защиты от DDoS и абьюза.

**Почему:** API Gateway throttling (уже настроен) ограничивает общий rate, но не per-IP. WAF добавляет per-IP rate limiting и managed rules (SQL injection, XSS patterns и т.д.). Это последний уровень защиты перед Lambda.

**Стоимость:** ~€7/мес (Web ACL $5 + 2 правила по $1).

**Как делать:**
1. **Создать Web ACL** через Terraform или AWS Console:
   - Rate limit rule: 300 requests / 5 min per IP
   - `AWSManagedRulesCommonRuleSet` — бесплатный managed rule group от AWS
   - Region: `eu-west-1` (совпадает с API Gateway)

2. **Привязать Web ACL** ко всем API Gateway stages:
   - `audio-api` (REST API)
   - `merlin-api` (HTTP API)
   - `vabamorf-api` (HTTP API)
   - `simplestore` (REST API)

3. **Включить в Count режиме** — WAF логирует, но не блокирует. Проверить CloudWatch метрики `BlockedRequests` и `CountedRequests` за 1 неделю.

4. **Переключить на Block** после подтверждения что легитимный трафик не попадает под rate limit.

**Terraform пример:**
```hcl
resource "aws_wafv2_web_acl" "hak_api" {
  name  = "hak-api-waf"
  scope = "REGIONAL"

  default_action { allow {} }

  rule {
    name     = "rate-limit"
    priority = 1
    action { count {} }  # Потом заменить на { block {} }

    statement {
      rate_based_statement {
        limit              = 300
        aggregate_key_type = "IP"
      }
    }
    visibility_config { ... }
  }

  rule {
    name     = "aws-common-rules"
    priority = 2
    override_action { count {} }  # Потом заменить на { none {} }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }
    visibility_config { ... }
  }
}
```

---

## 3. Serverless v4: настройка аутентификации и деплой (5.6)

**Что:** Serverless Framework v4 требует аутентификацию (Dashboard account или license key). Все `serverless.yml` и `package.json` уже обновлены до v4 — осталось настроить ключ и задеплоить.

**Почему:** Serverless v3 в maintenance mode с 2024, не получает security patches. v4 — активно развивается, без breaking changes для AWS provider.

**Как делать:**
1. Зарегистрироваться на [serverless.com](https://www.serverless.com) (бесплатно для open source / <$2M revenue)
2. Создать access key в Dashboard → Settings → Access Keys
3. Добавить `SERVERLESS_ACCESS_KEY` как env variable в CI/CD (GitHub Actions secrets)
4. Для локального деплоя: `serverless login` или `export SERVERLESS_ACCESS_KEY=...`
5. Деплоить по одному сервису в dev, smoke test каждый:
   ```bash
   cd packages/vabamorf-api && npx serverless deploy --stage dev
   cd packages/audio-api && npx serverless deploy --stage dev
   cd packages/merlin-api && npx serverless deploy --stage dev
   cd packages/simplestore && npx serverless deploy --stage dev
   cd packages/tara-auth && npx serverless deploy --stage dev
   ```
6. После проверки в dev — деплоить в prod по одному.

**Важно:** Если `SERVERLESS_ACCESS_KEY` не настроен, `serverless deploy` упадёт с ошибкой аутентификации. Альтернатива — `SERVERLESS_LICENSE_KEY` (без Dashboard, только CLI).

---

## Порядок выполнения

| # | Задача | Блокер | Время |
|---|--------|--------|-------|
| 1 | Serverless v4 auth setup | Регистрация на serverless.com | 30 мин |
| 2 | Deploy в dev + smoke test | Задача 1 | 2-3 часа |
| 3 | Deploy в prod | Задача 2 | 1 час |
| 4 | CSP мониторинг | Задача 3 (prod deploy) | 1-2 недели |
| 5 | CSP enforce | Задача 4 | 10 мин |
| 6 | WAF setup | AWS access + Terraform | 2-3 часа |
| 7 | WAF мониторинг | Задача 6 | 1 неделя |
| 8 | WAF enforce | Задача 7 | 10 мин |
