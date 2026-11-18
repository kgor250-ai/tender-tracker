import { DemoPortalAdapter } from './adapters/demo-portal.adapter';
import { TenderMatchingService } from './services/matcher.service';

console.log('🤖 Tender Collection & Ingestion Worker Initialized.');

const adapter = new DemoPortalAdapter();
const matcher = new TenderMatchingService();

console.log(`Registered Adapter: ${adapter.name} (${adapter.adapterKey})`);

