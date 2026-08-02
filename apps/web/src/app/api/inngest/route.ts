import { serve } from 'inngest/next';
import { inngest, generateSowDocument } from '@sow-platform/workflow';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateSowDocument],
});
