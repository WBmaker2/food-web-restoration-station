import { test, expect } from '@playwright/test';

test.describe('먹이망 연결 복원소 학생 흐름', () => {
  test('데스크톱에서 카드 선택과 예측·결과·다시하기 흐름이 이어진다', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.goto('/');
    await expect(page).toHaveTitle('먹이망 연결 복원소');
    await expect(page.locator('#main-content')).toBeVisible();

    await page.getByRole('button', { name: '업데이트 내역' }).click();
    await expect(page.getByRole('table', { name: '업데이트 내역' })).toBeVisible();

    await page.getByRole('button', { name: /미션 1/ }).click();
    await expect(page.getByRole('heading', { name: '미션 1: 기본 먹이망 복원' })).toBeVisible();
    await expect(page.locator('.clue-card__arrow')).toHaveCount(0);

    const grass = page.getByRole('button', { name: /풀, 생산자/ });
    const grasshopper = page.getByRole('button', { name: /메뚜기, 1차 소비자/ });
    await grass.click();
    await grasshopper.click();
    await expect(page.locator('.relation-canvas-feedback')).toContainText('연결했어요');
    await expect(page.getByRole('button', { name: /다음: 변화 예측하기/ })).toBeEnabled();

    await page.getByRole('button', { name: /다음: 변화 예측하기/ }).click();
    await expect(page.getByText('2단계: 변화 예측')).toBeVisible();
    await page.getByRole('button', { name: /다음: 결과 비교하기/ }).click();
    await expect(page.getByText('3단계: 결과 비교')).toBeVisible();

    await page.getByRole('button', { name: '이 단계 다시하기' }).click();
    await expect(page.getByText('1단계: 먹이망 복원')).toBeVisible();
    await expect(page.locator('.relation-prompt__hint')).toContainText('남은 연결 수: 4');
    expect(consoleErrors).toEqual([]);
  });

  test('375px 모바일에서는 단계형 연결만 노출되고 부분 연결 피드백이 보인다', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.getByRole('button', { name: /미션 5/ }).click();

    await expect(page.locator('.fweb-canvas')).toBeHidden();
    await expect(page.locator('.relation-prompt__steps')).toBeVisible();
    await expect(page.locator('.clue-card__arrow')).toHaveCount(0);

    const steps = page.locator('.relation-prompt__steps');
    await steps.getByRole('button', { name: /풀/ }).click();
    await steps.getByRole('button', { name: /메뚜기/ }).click();
    await steps.getByRole('button', { name: '연결 확인' }).click();

    await expect(page.locator('.relation-prompt__feedback')).toContainText('연결했어요');
    await expect(page.locator('.relation-prompt__hint')).toContainText('남은 연결 수: 2');

    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
  });
});
