# Security

- Never commit secrets. `.env` files are gitignored.
- Rotate if exposed: `OPENAI_API_KEY`, `OPENCAGE_API_KEY`.
- Local dev DB (`prisma/dev.db`) must not be committed.
- Report sensitive issues privately to the maintainer.
