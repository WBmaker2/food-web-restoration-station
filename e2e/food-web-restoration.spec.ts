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
    await expect(page.getByText('풀 → 메뚜기 → 개구리 → 뱀 → 매의 연결을 먼저 살펴봐요.')).toHaveCount(0);

    const grass = page.getByRole('button', { name: /풀, 생산자/ });
    const grasshopper = page.getByRole('button', { name: /메뚜기, 1차 소비자/ });
    const frog = page.getByRole('button', { name: /개구리, 2차 소비자/ });
    const snake = page.getByRole('button', { name: /뱀, 2차 소비자/ });
    const hawk = page.getByRole('button', { name: /매, 상위 소비자/ });
    await grass.click();
    await grasshopper.click();
    await expect(page.locator('.relation-canvas-feedback')).toContainText('연결했어요');
    await expect(page.getByRole('button', { name: /다음: 변화 예측하기 \(1\/4\)/ })).toBeDisabled();

    await grasshopper.click();
    await frog.click();
    await frog.click();
    await snake.click();
    await snake.click();
    await hawk.click();
    const restoreNext = page.getByRole('button', { name: /다음: 변화 예측하기 \(4\/4\)/ });
    await expect(restoreNext).toBeEnabled();

    await restoreNext.click();
    await expect(page.getByText('2단계: 변화 예측')).toBeVisible();
    await page.locator('summary', { hasText: '근거 문장 만들기' }).click();
    await expect(page.getByRole('button', { name: '문장 추가' })).toBeDisabled();
    const predictNext = page.getByRole('button', { name: /다음: 결과 비교하기/ });
    await expect(predictNext).toBeDisabled();
    await page.getByRole('radiogroup', { name: '메뚜기의 변화 예측' }).getByRole('radio', { name: '늘어남' }).click();
    await expect(predictNext).toBeEnabled();
    await predictNext.click();
    await expect(page.getByText('3단계: 결과 비교')).toBeVisible();

    await page.setViewportSize({ width: 320, height: 800 });
    const resultDimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(resultDimensions.scrollWidth).toBeLessThanOrEqual(resultDimensions.clientWidth + 1);
    await expect(page.locator('.result-card__table tbody tr').first()).toBeVisible();
    await expect(page.locator('.result-card__table td[data-label="가상 결과"]').first()).toBeVisible();

    await page.getByRole('button', { name: '예측 고치기' }).click();
    await page.getByRole('button', { name: /건너 연결/ }).click();
    const tooltipBox = await page.locator('.term-tip__help').boundingBox();
    expect(tooltipBox).not.toBeNull();
    expect(tooltipBox!.x).toBeGreaterThanOrEqual(0);
    expect(tooltipBox!.x + tooltipBox!.width).toBeLessThanOrEqual(320);
    await page.getByRole('button', { name: /다음: 결과 비교하기/ }).click();

    await page.getByRole('button', { name: '이 단계 다시하기' }).click();
    await expect(page.getByText('1단계: 먹이망 복원')).toBeVisible();
    await expect(page.locator('.relation-prompt__hint')).toContainText('남은 연결 수: 4');
    expect(consoleErrors).toEqual([]);
  });

  test('375px 모바일에서는 단계형 연결만 노출되고 부분 연결 피드백이 보인다', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.getByRole('button', { name: /미션 5/ }).click();
    await expect(page.getByRole('heading', { name: '미션 5: 대체 먹이가 있는 복원 사건' })).toBeInViewport();

    await expect(page.locator('.fweb-canvas')).toBeHidden();
    await expect(page.locator('.relation-prompt__steps')).toBeVisible();
    await expect(page.locator('.clue-card__arrow')).toHaveCount(0);

    const steps = page.locator('.relation-prompt__steps');
    await steps.getByRole('button', { name: /풀/ }).click();
    await steps.getByRole('button', { name: /메뚜기/ }).click();
    await steps.getByRole('button', { name: '연결 확인' }).click();

    await expect(page.locator('.relation-prompt__feedback')).toContainText('연결했어요');
    await expect(page.locator('.relation-prompt__hint')).toContainText('남은 연결 수: 2');
    await expect(page.getByRole('button', { name: /다음: 변화 예측하기 \(1\/3\)/ })).toBeDisabled();

    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
  });
});
