import type { StageConfig, StageId } from '../types/diwali'

export const STAGES: Record<StageId, StageConfig> = {
  LIVING_ROOM: {
    id: 'LIVING_ROOM',
    name: 'Living Room',
    hindiName: 'बैठक (Hall)',
    subtitle: 'Where Guests & Relatives Gather',
    targetScore: 1000,
    timeLimit: 45,
    themeColor: '#2b0c48',
    accentColor: '#ff9900',
    floorColor: '#3d1663',
    description: 'Clear sofa dust, spiderwebs behind the TV unit, and shine the glass tables!',
    mummyBriefing:
      'Beta! Diwali cards party guests are coming in 30 minutes! The sofas have dust, the ceiling has webs, and Sharma ji is already gloating about his clean home. Pick up that jhadu NOW!',
    roomIcon: '🛋️',
  },
  KITCHEN: {
    id: 'KITCHEN',
    name: 'Diwali Rasoi',
    hindiName: 'रसोई (Kitchen)',
    subtitle: 'Sweets, Spices & Frying Namkeen',
    targetScore: 1800,
    timeLimit: 45,
    themeColor: '#421608',
    accentColor: '#ff7700',
    floorColor: '#5c220f',
    description: 'Chakli flour, besan crumbs, syrup drips, and brass utensils need urgent wiping!',
    mummyBriefing:
      'Chakli, Gulab Jamun, and Namkeen are made, but look at the kitchen counter! Lakshmi Puja bhog cannot be prepared in this mess. Clean every shelf quickly!',
    roomIcon: '🍳',
  },
  BEDROOM: {
    id: 'BEDROOM',
    name: 'Guest Bedroom',
    hindiName: 'शयनकक्ष (Bedroom)',
    subtitle: 'New Clothes & Almirah Chaos',
    targetScore: 2800,
    timeLimit: 40,
    themeColor: '#12253a',
    accentColor: '#00d2ff',
    floorColor: '#1b3b5c',
    description: 'Fold festive kurtas, sweep under the bed, and hang up the fairy lights!',
    mummyBriefing:
      'All your new Diwali outfits are scattered on the bed! Fold the clothes, sweep under the wooden almirah, and make sure Dadi does not see this tornado!',
    roomIcon: '🛏️',
  },
  MAIN_ENTRANCE: {
    id: 'MAIN_ENTRANCE',
    name: 'Main Gateway & Rangoli',
    hindiName: 'मुख्य द्वार (Entrance)',
    subtitle: 'Welcoming Goddess Lakshmi',
    targetScore: 4000,
    timeLimit: 40,
    themeColor: '#30082b',
    accentColor: '#ffcc00',
    floorColor: '#4f1047',
    description: 'Sweep the marble steps, hang fresh marigold torans, and light the sacred diyas!',
    mummyBriefing:
      'This is it! Goddess Lakshmi enters through the main door. Sweep the verandah spotless, protect the peacock rangoli, and light all the diyas for the grand Puja!',
    roomIcon: '🪔',
  },
}

export const STAGE_ORDER: StageId[] = ['LIVING_ROOM', 'KITCHEN', 'BEDROOM', 'MAIN_ENTRANCE']
