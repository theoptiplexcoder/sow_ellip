import * as Sentry from '@sentry/nextjs';
import { inngest } from '../client';

export const generateSowDocument = inngest.createFunction(
  {
    id: 'generate-sow-document',
    triggers: [{ event: 'sow/approved' }],
    onFailure: async ({ error, event }) => {
      // Surface failed pipeline steps in Sentry, not just Inngest's own dashboard.
      Sentry.captureException(error, { extra: { event } });
    },
  },
  async ({ step }) => {
    await step.run('extract', async () => {
      /* read structured SOW revision data */
    });
    await step.run('populate', async () => {
      /* fill DOCX placeholders using the structured data */
    });
    const docxUrl = await step.run('generate-docx', async () => {
      /* produce the filled .docx, store in Supabase Storage */
    });
    const pdfUrl = await step.run('convert-to-pdf', async () => {
      /* call Gotenberg, store resulting PDF in Supabase Storage */
    });
    await step.run('audit-log', async () => {
      /* record each step's completion/failure with metadata */
    });
    return { docxUrl, pdfUrl };
  },
);
