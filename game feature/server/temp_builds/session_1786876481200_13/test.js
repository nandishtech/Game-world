/**
 * Chess Move logic test suite
 */
import { assert } from 'console';

function calculatePawnMoves(idx, board, color) {
  const row = Math.floor(idx / 8);
  const col = idx % 8;
  const moves = [];
  const dir = color === 'w' ? -1 : 1;
  const startRow = color === 'w' ? 6 : 1;

  const fIdx = (row + dir) * 8 + col;
  if (board[fIdx] === null) {
    moves.push(fIdx);
    const dIdx = (row + dir * 2) * 8 + col;
    if (row === startRow && board[dIdx] === null) {
      moves.push(dIdx);
    }
  }
  return moves;
}

function runTests() {
  console.log("-----------------------------------------");
  console.log("RUNNING CHESS PIECE ENGINE TESTS...");
  console.log("-----------------------------------------");

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`);
      console.error(err);
      failed++;
    }
  }

  test("Pawn standard starting double-step", () => {
    const board = Array(64).fill(null);
    board[52] = 'wP'; // White pawn on E2 (index 52)
    const moves = calculatePawnMoves(52, board, 'w');
    
    assert(moves.includes(44), "Should contain step to E3 (index 44)");
    assert(moves.includes(36), "Should contain double step to E4 (index 36)");
  });

  test("Pawn double-step blocked", () => {
    const board = Array(64).fill(null);
    board[52] = 'wP';
    board[44] = 'bP'; // Blocked at E3 (index 44)
    const moves = calculatePawnMoves(52, board, 'w');
    
    assert(moves.length === 0, "Blocked pawn should have no forward moves");
  });

  console.log("-----------------------------------------");
  console.log(`TESTS RESULTS: ${passed} PASSED // ${failed} FAILED`);
  console.log("-----------------------------------------");
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
