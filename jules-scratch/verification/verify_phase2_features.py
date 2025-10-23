from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # 1. Navegar para a aplicação
            page.goto("http://localhost:5173", timeout=60000)

            # 2. Verificar se os componentes principais estão visíveis
            expect(page.get_by_role("heading", name="Trade Signal Generator")).to_be_visible()
            expect(page.get_by_role("heading", name="Sentimento de Mercado")).to_be_visible(timeout=20000)

            # 3. Fazer seleções
            page.get_by_label("Ativo").select_option("BTC")
            page.get_by_label("Timeframe").select_option(label="Diário")
            page.get_by_label("Agressividade").select_option("Conservador")

            # 4. Clicar para gerar o sinal
            page.get_by_role("button", name="Gerar Sinal").click()

            # 5. Esperar pelo resultado (gráfico e tabela)
            expect(page.get_by_role("heading", name="Gráfico de Preços e Indicadores")).to_be_visible(timeout=60000)
            expect(page.get_by_role("heading", name="Sinais de Trade Gerados")).to_be_visible(timeout=60000)

            # 6. Tirar screenshot
            screenshot_path = "jules-scratch/verification/phase2_verification.png"
            page.screenshot(path=screenshot_path, full_page=True)
            print(f"Screenshot salvo em {screenshot_path}")

        except Exception as e:
            print(f"Ocorreu um erro durante a verificação: {e}")
            page.screenshot(path="jules-scratch/verification/error_phase2.png", full_page=True)
        finally:
            browser.close()

if __name__ == "__main__":
    run_verification()