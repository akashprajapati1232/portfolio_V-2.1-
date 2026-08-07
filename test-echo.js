import { dataService } from './js/services/DataService.js';
import { echoAI } from './js/components/ai/EchoAI.js';

async function test() {
    console.log("Loading data...");
    await dataService.loadAll();
    console.log("Data loaded, initializing echoAI...");
    echoAI.init();
    console.log("echoAI initialized successfully!");
    
    // Simulate user search
    const results = echoAI.processQuery("React");
    console.log("Search for React:", results.sections);
}
test().catch(e => console.error(e));
