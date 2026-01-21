
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
    try {
        const legacyMigrations = [
            '20250830222528_init',
            '20250903173447_init_chart_tables',
            '20250903220314_make_sign_fields_optional',
            '20250904202857_add_question_option_and_fix_response',
            '20250908123403_add_survey_models_keep_astro_fields',
            '20250910130625_add_astro_angles',
            '20251002231925_add_full_pdf_tables',
            '20251007163704_add_survey_core_safe',
            '20251008124356_drop_answer_num',
            '20251008124547_add_response_indexes',
            '20251102151803_add_email_outbox_and_reading'
        ];

        console.log(`Cleaning ${legacyMigrations.length} legacy migrations definitions from _prisma_migrations table...`);

        // Using raw query to delete from internal table
        const result = await prisma.$executeRawUnsafe(`
      DELETE FROM "_prisma_migrations" 
      WHERE "migration_name" IN (${legacyMigrations.map(m => `'${m}'`).join(',')});
    `);

        console.log(`Deleted ${result} rows.`);
    } catch (e) {
        console.error("Error cleaning migrations:", e);
    } finally {
        await prisma.$disconnect();
    }
}

clean();
