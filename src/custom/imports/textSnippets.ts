import type { z } from 'zod';
import { CustomFunction } from '..';
import { type customFuncInputItemSchema, customFuncInputsSchema } from '../';

const loremStandard =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus tincidunt tortor ac rutrum efficitur. Duis a condimentum ex. Aenean ac gravida erat. Nulla tristique, est eu hendrerit luctus, diam urna hendrerit ante, id maximus elit urna sit amet eros. Suspendisse vitae purus leo. Donec id tempor ligula, sed vestibulum tortor. Etiam sapien libero, rutrum eget tincidunt eu, malesuada venenatis sapien. Proin quis ipsum vitae metus egestas placerat. Pellentesque in turpis euismod, finibus dolor vitae, placerat nibh. Pellentesque at aliquet turpis, non varius nulla.';

const loremFox = 'The quick brown fox jumps over the lazy dog';

const loremGettysburg =
  'Four score and seven years ago our fathers brought forth on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal. Now we are engaged in a great civil war, testing whether that nation, or any nation so conceived and so dedicated, can long endure. We are met on a great battle-field of that war. We have come to dedicate a portion of that field, as a final resting place for those who here gave their lives that that nation might live. It is altogether fitting and proper that we should do this. But, in a larger sense, we can not dedicate -- we can not consecrate -- we can not hallow -- this ground. The brave men, living and dead, who struggled here, have consecrated it, far above our poor power to add or detract. The world will little note, nor long remember what we say here, but it can never forget what they did here. It is for us the living, rather, to be dedicated here to the unfinished work which they who fought here have thus far so nobly advanced. It is rather for us to be here dedicated to the great task remaining before us -- that from these honored dead we take increased devotion to that cause for which they gave the last full measure of devotion -- that we here highly resolve that these dead shall not have died in vain -- that this nation, under God, shall have a new birth of freedom -- and that government of the people, by the people, for the people, shall not perish from the earth.';

const unicodeItems = customFuncInputsSchema.parse([
  {
    title: 'Unicode: Up Arrow',
    subtitle: '↑',
    arg: '↑',
  },
  {
    title: 'Unicode: Down Arrow',
    subtitle: '↓',
    arg: '↓',
  },
  {
    title: 'Unicode: Left Arrow',
    subtitle: '←',
    arg: '←',
  },
  {
    title: 'Unicode: Right Arrow',
    subtitle: '→',
    arg: '→',
  },
  {
    title: 'Unicode: Up Right Arrow',
    subtitle: '↗',
    arg: '↗',
  },
  {
    title: 'Unicode: Up Left Arrow',
    subtitle: '↖',
    arg: '↖',
  },
  {
    title: 'Unicode: Down Right Arrow',
    subtitle: '↘',
    arg: '↘',
  },
  {
    title: 'Unicode: Down Left Arrow',
    subtitle: '↙',
    arg: '↙',
  },
  {
    title: 'Unicode: Redaction Block',
    subtitle: '█████',
    arg: '█████',
  },
  {
    title: 'Unicode: White Cloud',
    subtitle: '☁️',
    arg: '☁️',
  },
  {
    title: 'Unicode: Black Cloud',
    subtitle: '☁︎',
    arg: '☁︎',
  },
  {
    title: 'Unicode: Infinity Symbol',
    subtitle: '∞',
    arg: '∞',
  },
  {
    title: 'Unicode: Euro Sign',
    subtitle: '€',
    arg: '€',
  },
]);

// Define function that provides Alfred its {query} arg
const fn1 = (arg: z.infer<typeof customFuncInputItemSchema>) => {
  return typeof arg === 'string' ? arg : (arg.arg ?? '');
};

const unicodeMenus = new CustomFunction<string>({
  inputs: unicodeItems,
  iconPath: 'dist/img/icons/unicode.png',
}).menus(fn1);

const militaryOrders = [
  'Establish a phased logistics plan to sustain company-level operations for 14 days, to include resupply nodes, priority commodities, and fallback options',
  'Reconnoiter primary and alternate movement corridors and report obstacles to mobility, civilian traffic patterns, and estimated transit times.',
  'Task the signals element to validate comms redundancy along plannned routes and certify at least two independent relay paths.',
  'Prepare an embarkation timeline for vehicle and personnel movement to the assembly area, with checkpoints for vehicle readiness and fuel status.',
  'Conduct a limited live-fire rehearsal for indirect fire coordination with safety observers present; document lessons learned and recommended mitigations.',
  'Assign unmanned aerial systems to persistent overwatch of the designated sector to detect changes in activity and provide hourly situational updates.',
  'Execute a deliberate reconnaissance in force of Objective X to assess defenses, civilian presence, and potential ingress/egress routes; prioritize information over engagement.',
  'Preposition engineer assets and bridging equipment at designated staging areas to reduce predicted mobility interruptions during seasonal weather events.',
  'Implement strict ammunition accountability procedures across all echelons; reissue thresholds require battalion HQ approval.',
  'Task the intelligence cell to produce a 48-hour products stack summarizing local order of battle indicators, supply lines, and recent movement patterns.',
  'Schedule rotational patrols with randomized timing and routing to maximize area denial presence while minimizing predictability.',
  'Coordinate a joint logistics delivery window with coalition partners to consolidate convoy movements and reduce overall footprint.',
  'Initiate cross-deck medical evacuation drills between forward aid stations and casualty receiving facilities; validate timelines and handover procedures.',
  'Issue an order to suspend non-essential forward movements until route clearance teams have certified lanes free of hazards.',
  'Conduct an ordnance disposal and legacy-munitions sweep in the forward sorting area and produce a clearance certification before equipment staging.',
  'Authorize limited air sorties for reconnaissance and target development only; kinetic effects require command authorization with corroborating intelligence.',
  'Establish an intelligence-sharing link with adjacent units to synchronize common operating pictures and merge relevant HUMINT and SIGINT reporting.',
  'Execute a phased deception plan to mask the timing and direction of forthcoming maneuver elements, ensuring compliance with ROE and legal counsel.',
  'Order sustainment planners to model three supply consumption rates (routine, increased, surge) and prepare corresponding resupply schedules.',
  'Direct the ordnance officer to audit explosive storage and transportation procedures and submit corrective actions within 72 hours.',
  'Task vehicle maintenance units to perform mission-config inspections and declare readiness or list required A/B-level repairs before redeployment.',
  'Assign recon teams to verify key terrain features identified in planning maps and provide geolocated imagery and assessment summaries.',
  'Institute a phased movement with hard and soft times to minimize convoy exposure; incorporate contingency plans for mechanical failure and escort requirements.',
  'Order intelligence to prioritize identifying logistic nodes and choke points in the AO and recommend mitigation options to preserve resupply flow.',
  'Initiate an after-action review template to capture tactical, logistical, and command-and-control lessons from the next operation and route findings to the training section.',
];

const militaryMenuItems = customFuncInputsSchema.parse([
  {
    title: 'Military Orders: 1-5',
    subtitle: `1-5: e.g. ${militaryOrders.slice(0, 5).join(', ').substring(0, 60)}...`,
    arg: militaryOrders.slice(0, 5).join('\n\n'),
  },
  {
    title: 'Military Orders: 6-10',
    subtitle: `6-10: e.g. ${militaryOrders.slice(5, 10).join(', ').substring(0, 60)}...`,
    arg: militaryOrders.slice(5, 10).join('\n\n'),
  },
  {
    title: 'Military Orders: 11-15',
    subtitle: `11-15: e.g. ${militaryOrders.slice(10, 15).join(', ').substring(0, 60)}...`,
    arg: militaryOrders.slice(10, 15).join('\n\n'),
  },
  {
    title: 'Military Orders: 16-20',
    subtitle: `16-20: e.g. ${militaryOrders.slice(15, 20).join(', ').substring(0, 60)}...`,
    arg: militaryOrders.slice(15, 20).join('\n\n'),
  },
  {
    title: 'Military Orders: 21-25',
    subtitle: `21-25: e.g. ${militaryOrders.slice(20, 25).join(', ').substring(0, 60)}...`,
    arg: militaryOrders.slice(20, 25).join('\n\n'),
  },
]);

// Define function that provides Alfred its {query} arg
const fn2 = (arg: z.infer<typeof customFuncInputItemSchema>) => {
  return typeof arg === 'string' ? arg : (arg.arg ?? '');
};

const militaryOrderMenus = new CustomFunction<string>({
  inputs: militaryMenuItems,
  iconPath: 'dist/img/icons/dod.png',
}).menus(fn2);

const fn3 = (arg: z.infer<typeof customFuncInputItemSchema>) => {
  return typeof arg === 'string' ? arg : (arg.arg ?? '');
};

const loremMenus = new CustomFunction<string>({
  inputs: customFuncInputsSchema.parse([
    {
      title: 'Lorem Ipsum Standard',
      subtitle: `${loremStandard.substring(0, 60)}...`,
      arg: loremStandard,
    },
    {
      title: 'Lorem Ipsum Fox',
      subtitle: loremFox,
      arg: loremFox,
    },
    {
      title: 'Gettysburg Address',
      subtitle: `${loremGettysburg.substring(0, 60)}...`,
      arg: loremGettysburg,
    },
  ]),
  iconPath: 'dist/img/icons/lorem.png',
}).menus(fn3);

export { militaryOrderMenus, unicodeMenus, loremMenus };
