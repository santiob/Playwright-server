import { test, expect } from '@playwright/test';

async function cerrarTooltipIframe(page, maxPasos = 10) {
  console.log('🔍 Cerrando tooltip...');
  const iframe = page.frameLocator('iframe[title="juego"]');
  await page.waitForTimeout(1500);

  for (let i = 0; i < maxPasos; i++) {
    const floater = iframe.locator('div.__floater.__floater__open');
    if (!await floater.isVisible().catch(() => false)) {
      if (i > 0) console.log(`✅ Cerrado en ${i} pasos`);
      else console.log('✅ No hay tooltip');
      return true;
    }

    console.log(`⚠️ Paso ${i + 1}`);

    const botonX = iframe.locator('button.step_closeStep__fJaF_');
    if (await botonX.isVisible().catch(() => false)) {
      await botonX.click();
      console.log('  ✓ X cerrado');
      await page.waitForTimeout(1500);
      continue;
    }

    const siguiente = iframe.locator('button:has-text("Siguiente")');
    if (await siguiente.isVisible().catch(() => false)) {
      await siguiente.click();
      console.log('  ✓ Siguiente');
      await page.waitForTimeout(1500);
      continue;
    }

    const cerrar = iframe.locator('button:has-text("Cerrar")');
    if (await cerrar.isVisible().catch(() => false)) {
      await cerrar.click();
      console.log('  ✓ Cerrar');
      await page.waitForTimeout(1500);
      continue;
    }

    break;
  }

  if (await iframe.locator('div.__floater.__floater__open').isVisible().catch(() => false)) {
    const content = await page.locator('iframe[title="juego"]').contentFrame();
    if (content) {
      await content.evaluate(() => {
        document.querySelectorAll('.__floater').forEach(el => el.remove());
      });
      await page.waitForTimeout(500);
      console.log('  ✓ Eliminado del DOM');
    }
  }

  console.log('✅ Completado');
  return true;
}

test.describe('Test Lotline La Correntina', () => {

  test.beforeEach(async ({ page }) => {
    const username = process.env.TEST_CNQ_USER;
    const password = process.env.TEST_CNQ_PASSWORD;

    if (!username || !password) {
      test.skip();
      console.log('⚠️ Test saltado: Credenciales no configuradas');
      return;
    }

    await page.goto('/plataforma/');
    console.log('🔐 Iniciando sesión...');

    await page.locator('#nroDocu').first().fill(username);
    await page.locator('#clave').first().fill(password);
    //await page.click('button:has-text("INGRESAR")');
    await page.locator('#botonLogin-20').click();

    await page.waitForURL(/.*\/home/, { timeout: 10000 });
    console.log('✅ Login exitoso - En pantalla de juegos');
  });

  test('Quiniela Tradicional', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/plataforma\/home/);
    console.log('✅ Paso 1: En pantalla de juegos');

    await page.waitForTimeout(1500);
    const modalHeader = page.locator('#headerModal-12, .modalHeader-12');
    const isModalVisible = await modalHeader.isVisible().catch(() => false);

    if (isModalVisible) {
      console.log('⚠️ Modal de Avisos generales detectado, cerrándolo...');
      await page.locator('.modalHeader-12 button.close').click();
      await page.waitForTimeout(1000);
      console.log('✅ Modal cerrado exitosamente');
    } else {
      console.log('✅ No hay modal de avisos');
    }

    console.log('🖱️ Paso 2: Buscando botón Quiniela Tradicional...');
    const quinielaButton = page.locator('button:has-text("Quiniela tradicional"), a:has-text("Quiniela tradicional"), [class*="sc-bQCEYZ ebymVa position-relative  align-self-center"]').first();
    await quinielaButton.click();
    console.log('✅ Click en Quiniela Tradicional ejecutado');

    await page.waitForURL(/.*\/juego\/Quinielatradicional/i, { timeout: 10000 });
    console.log('✅ Paso 3: Navegación a pantalla de sorteos exitosa');
    await page.waitForTimeout(500);

    const iframe = page.frameLocator('iframe#zonaJuego');

    console.log('🖱️ Paso 4: Seleccionando sorteo Nocturna...');
    const nocturnaH6 = iframe.locator('h6.fontDescEve:has-text("Nocturna")').first();
    await nocturnaH6.waitFor({ state: 'visible', timeout: 5000 });
    await nocturnaH6.click();
    console.log('✅ Sorteo Nocturna seleccionado');

    const numeroAleatorio = Math.floor(Math.random() * 100);
    console.log('🎲 Paso 5: Número aleatorio generado:', numeroAleatorio);
    const campoNumero = iframe.locator('label.bet-label:has-text("Numero")').locator('..').locator('input').first();
    await campoNumero.waitFor({ state: 'visible', timeout: 5000 });
    await campoNumero.fill(numeroAleatorio.toString());

    console.log('📝 Paso 6: Completando campo Alcance...');
    const campoAlcance = iframe.locator('label.bet-label:has-text("Alcance")').locator('..').locator('input').first();
    await campoAlcance.waitFor({ state: 'visible', timeout: 5000 });
    await campoAlcance.fill('10');

    console.log('💰 Paso 7: Completando campo Importe...');
    const campoImporte = iframe.locator('label.bet-label:has-text("Importe")').locator('..').locator('input').first();
    await campoImporte.waitFor({ state: 'visible', timeout: 5000 });
    await campoImporte.fill('100');

    console.log('🖱️ Paso 8: Click en botón +...');
    const botonMas = iframe.locator('button#btn-addJugada').first();
    await botonMas.waitFor({ state: 'visible', timeout: 5000 });
    await botonMas.click();
    await page.waitForTimeout(1000);

    console.log('🖱️ Paso 9: Click en botón Siguiente...');
    const botonSiguiente = iframe.locator('button#botonDerecha:has-text("Siguiente"), button.botonDerecha:has-text("Siguiente")').first();
    await botonSiguiente.waitFor({ state: 'visible', timeout: 5000 });
    await botonSiguiente.click();
    await page.waitForTimeout(2000);
    console.log('✅ Pantalla de selección de extracto abierta');

    console.log('🖱️ Paso 10: Seleccionando extracto Corrientes...');
    const botonCorrientes = iframe.locator('label#btnExtracto:has-text("Corrientes"), label.extractoButton:has-text("Corrientes")').first();
    await botonCorrientes.waitFor({ state: 'visible', timeout: 5000 });
    await botonCorrientes.click();
    await page.waitForTimeout(1000);

    console.log('🖱️ Paso 11: Click en botón Jugar...');
    const botonJugar = iframe.locator('button#botonDerecha:has-text("Jugar"), button.botonDerecha:has-text("Jugar")').first();
    await botonJugar.waitFor({ state: 'visible', timeout: 5000 });
    await botonJugar.click();
    await page.waitForTimeout(1000);

    console.log('📋 Paso 12: Validando popup del cupón...');
    const cuponPopup = iframe.locator('div#download.cuponFinal').first();
    await cuponPopup.waitFor({ state: 'visible', timeout: 10000 });

    const mensajeExito = iframe.locator('div.text-success:has-text("¡CUPON GENERADO!")').first();
    await mensajeExito.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✅ Mensaje "¡CUPON GENERADO!" confirmado');

    await page.screenshot({ path: 'test-results/cnq-quiniela-cupon-generado.png', fullPage: true });
    console.log('🎉 ¡Test de Quiniela Tradicional completado exitosamente!');
  });

  test('Poceada Correntina', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/plataforma\/home/);
    console.log('✅ Paso 1: En pantalla de juegos');

    await page.waitForTimeout(1500);
    const modalHeader = page.locator('#headerModal-12, .modalHeader-12');
    const isModalVisible = await modalHeader.isVisible().catch(() => false);

    if (isModalVisible) {
      console.log('⚠️ Modal de Avisos generales detectado, cerrándolo...');
      await page.locator('.modalHeader-12 button.close').click();
      await page.waitForTimeout(1000);
      console.log('✅ Modal cerrado exitosamente');
    } else {
      console.log('✅ No hay modal de avisos');
    }

    console.log('🖱️ Paso 2: Click en Poceada Correntina...');
    await page.getByRole('link', { name: 'img Poceada Correntina' }).click();
    console.log('✅ Click en Poceada ejecutado');

    await page.waitForTimeout(3000);

    const iframe = page.frameLocator('iframe[title="juego"]');
    await page.waitForTimeout(1500);

    await cerrarTooltipIframe(page);
    await page.waitForTimeout(1000);

    console.log('🖱️ Paso 3: Click en botón suerte...');
    const botonSuerte = iframe.locator('#boton-suerte');
    await botonSuerte.click({ force: true });
    console.log('✅ Botón suerte activado');

    await page.waitForTimeout(1000);

    console.log('🖱️ Paso 4: Click en botón Avanzar...');
    await iframe.getByRole('button', { name: /Avanzar/i }).click();
    console.log('✅ Botón Avanzar clickeado');

    await page.waitForTimeout(2000);

    console.log('🖱️ Paso 5: Click en botón Confirmar...');
    const botonConfirmar = iframe.getByRole('button', { name: /Confirmar/i });
    await botonConfirmar.click();
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'test-results/cnq-poceada-cupon-generado.png', fullPage: true });
    console.log('🎉 ¡Test de Poceada completado exitosamente!');
  });

});
