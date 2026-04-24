let pass = 0;
let fail = 0;

export function assert(condition, message) {
    if (!condition) {
        console.error("❌ FAIL:", message);
        fail++;
    } else {
        console.log("✅ PASS:", message);
        pass++;
    }
}

export function total() {
    console.log("\n── Hotovo ──\n");
    console.log("✅ PASS:", pass);
    console.error("❌ FAIL:", fail);
}