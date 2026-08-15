/* Which walk is loaded. The engine, layout and every era-keyed system
   are built once at module load from whichever TIMELINE is active, so
   the choice is made from the URL before anything else imports data:

     /                 → the Record, 1526–1947 (default)
     /?walk=ledger     → the documented corridor, 2014–today

   Switching walks is a full page load by design — the scene is a
   WebGL singleton and the corridor is baked from its dataset.       */
const params = new URLSearchParams(typeof location !== 'undefined' ? location.search : '');
const key = params.get('walk') === 'ledger' ? 'ledger' : 'main';

export const WALK = key === 'ledger'
  ? { key, title: 'The Republic’s Ledger', range: '2014 – today',
      docTitle: 'A Cockroach’s Questions — Walk 2014 → today', hashPrefix: '' }
  : { key, title: 'Walk Through Time', range: '1526 – 1947',
      docTitle: 'Walk Through Time: 1526–1947', hashPrefix: '' };

export const MAIN_WALK_URL   = './';
export const LEDGER_WALK_URL = './?walk=ledger';
