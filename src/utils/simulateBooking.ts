// src/utils/simulateBooking.ts
export const simulateBooking = (delay = 700): Promise<{ success: boolean }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const rand = Math.random();
      resolve({ success: rand >= 0.15 }); // 85% success, 15% fail
    }, delay);
  });
};
