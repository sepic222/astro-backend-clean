const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check(id) {
    const chart = await prisma.chart.findUnique({ where: { id } });
    console.log("Chart ID:", chart.id);
    console.log("Timezone Offset:", chart.tzOffsetMinutes); // Should be -240 for NYC in June
    console.log("City:", chart.city);
}

// New York Test ID
check('cmjg9itqy0000f63dgpm7pr90')
    .finally(async () => await prisma.$disconnect());
