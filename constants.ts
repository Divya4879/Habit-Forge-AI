import type { Habit, Timeframe, ArtStyle } from './types';
import { 
    WaterDropIcon, 
    BrainCircuitIcon, 
    DumbbellIcon, 
    RocketIcon, 
    UsersIcon,
    CleanEatingIcon,
    GoodSleepIcon,
    ReadingIcon,
    LearningIcon,
    ProductivityIcon,
    ScreenTimeIcon,
    SedentaryIcon,
    SkippingMealsIcon,
    BadSleepIcon,
    BotIcon
} from './components/IconComponents';

export const HABITS: Habit[] = [
  {
    id: 'water',
    name: 'Hydration (4L Daily)',
    description: 'Consistent and adequate water intake.',
    prompt_detail: 'Show the effects of deep, consistent hydration. The skin is supple, moisturized, with a luminous inner glow. The face looks vital and plump. The person has a gentle, content smile, and the overall appearance is refreshed and vibrant.',
    background_detail: 'The background is bright and airy, perhaps with subtle hints of morning dew or glistening water droplets, enhancing the feeling of freshness and purity.',
    icon: WaterDropIcon,
  },
  {
    id: 'meditation',
    name: 'Meditation (15 mins Daily)',
    description: 'Daily mindfulness and stress reduction.',
    prompt_detail: 'Reflect a profound sense of inner peace. Facial muscles are relaxed, smoothing stress lines. The expression is serene and centered. A subtle, calming aura of light could emanate from around the head, symbolizing a clear and focused mind.',
    background_detail: 'The background is a tranquil, minimalist space like a zen garden or a room with soft, natural light, creating a peaceful and centered atmosphere.',
    icon: BrainCircuitIcon,
  },
  {
    id: 'workout',
    name: 'Workout (45 mins Daily)',
    description: 'Regular physical exercise.',
    prompt_detail: 'Illustrate the results of consistent workouts: a leaner, more toned physique. Features are more defined. Skin has a healthy, vibrant glow. Posture is more upright. The expression is energetic and disciplined, with a confident smile.',
    background_detail: 'The setting suggests an active lifestyle, like a modern, well-lit gym or an inspiring outdoor landscape at sunrise, evoking energy and discipline.',
    icon: DumbbellIcon,
  },
  {
    id: 'clean_eating',
    name: 'Clean Eating',
    description: 'Avoiding processed and junk food.',
    prompt_detail: 'Depict the benefits of a clean diet. The skin is clear and vibrant, radiating a healthy inner glow. Reduced puffiness leads to a more defined facial structure. The person has a natural, easy smile, reflecting their inner well-being.',
    background_detail: 'The background features elements of nature and health, such as a sun-drenched kitchen with fresh produce or a lush, green garden.',
    icon: CleanEatingIcon,
  },
  {
    id: 'good_sleep',
    name: 'Consistent Sleep (8 hours)',
    description: 'Prioritizing restful and adequate sleep.',
    prompt_detail: 'Visualize the effects of "beauty sleep". Dark circles are gone. The eyes are bright and sparkling. The skin is rejuvenated with a healthy glow. The expression is calm and positive, with a happy, well-rested smile that reflects a great mood.',
    background_detail: 'The background is a calm and restful bedroom at dawn, with soft, gentle light filtering through a window, signifying a peaceful night and a fresh start.',
    icon: GoodSleepIcon,
  },
  {
    id: 'reading',
    name: 'Daily Reading (30 mins)',
    description: 'Engaging the mind with books.',
    prompt_detail: 'Capture the look of an enlightened, intellectually engaged mind. The eyes are bright and curious. The expression is calm and confident, with a subtle, knowing smile. A faint, intricate pattern of light could be visualized around the temples, symbolizing heightened neural activity.',
    background_detail: 'The avatar is in a cozy, well-lit library or reading nook, surrounded by books, which imparts a sense of wisdom and intellectual curiosity.',
    icon: ReadingIcon,
  },
  {
    id: 'learning',
    name: 'Learning a New Skill',
    description: 'Consistently challenging the mind.',
    prompt_detail: 'Illustrate an actively engaged and sharp mind. The eyes are alert and focused. The expression conveys quiet confidence and heightened curiosity. A subtle, warm glow of intellectual energy emanates from the person\'s head, representing new neural connections.',
    background_detail: 'The background is a clean, organized workspace or studio that reflects the skill being learned (e.g., musical instruments, art supplies), suggesting focus and creativity.',
    icon: LearningIcon,
  },
  {
    id: 'productivity',
    name: 'Mindful Productivity',
    description: 'Focused, effective work without burnout.',
    prompt_detail: 'Depict a state of calm focus. Signs of stress are reduced. The skin is clear, and the expression is composed and confident, with a smile of satisfaction. There is a clear, focused aura of accomplishment around the person.',
    background_detail: 'The setting is an inspiring and organized office or workspace with natural light, signifying clarity, focus, and achievement.',
    icon: ProductivityIcon,
  },
  {
    id: 'hard_work',
    name: 'Focused Goal Pursuit',
    description: 'Diligent work towards a personal goal.',
    prompt_detail: 'Show the look of someone diligently pursuing their goals. The expression is one of focus and determination, coupled with a confident, resilient smile. The eyes are sharp and driven. There\'s a powerful aura of accomplishment and forward momentum.',
    background_detail: 'The background symbolizes the goal being pursued—perhaps an abstract representation of success, a cityscape, or a mountain peak—giving a sense of ambition.',
    icon: RocketIcon,
  },
  {
    id: 'social',
    name: 'Genuine Social Connection',
    description: 'Meaningful interactions with others.',
    prompt_detail: 'Reflect the warmth and joy of meaningful social connections. The expression is genuinely happy, with an infectious smile that creates natural smile lines around the eyes and mouth. The overall aura is radiant, open, and approachable.',
    background_detail: 'The background is a warm, inviting social setting like a cozy cafe or a park with friends blurred softly in the distance, conveying a sense of community and happiness.',
    icon: UsersIcon,
  },
];

export const NEGATIVE_HABITS: Habit[] = [
    {
        id: 'screen_time',
        name: 'Excessive Screen Time',
        description: 'Staring at screens for long hours.',
        prompt_detail: 'Illustrate the strain of excessive screen time. The eyes are tired, strained, and bloodshot, with dark circles. The expression is fatigued and blank. The skin is dull from blue light stress. The ambient lighting should be dim and artificial, casting slight, unflattering shadows on the face.',
        background_detail: 'The background is a dark, claustrophobic room, lit only by the cold, artificial blue light of a screen, creating a sense of isolation and fatigue.',
        icon: ScreenTimeIcon,
        recoveryHabitId: 'meditation',
    },
    {
        id: 'sedentary',
        name: 'Little Physical Activity',
        description: 'A lifestyle with minimal movement.',
        prompt_detail: 'Depict the effects of a sedentary lifestyle. A softer, less defined facial structure, puffiness, and a dull skin complexion from poor circulation. The expression is one of low energy and lethargy. The lighting is flat and uninspired, contributing to a washed-out, lifeless appearance.',
        background_detail: 'The setting is a dim, uninspiring indoor space that feels static and closed-off, reflecting a lack of movement and vitality.',
        icon: SedentaryIcon,
        recoveryHabitId: 'workout',
    },
    {
        id: 'skipping_meals',
        name: 'Skipping Meals',
        description: 'Irregular eating patterns.',
        prompt_detail: 'Show the visible toll of irregular eating. The skin is sallow, and the face looks gaunt or puffy. The eyes lack vibrancy. The expression is irritable and strained. The lighting should be harsh, creating sharp shadows that emphasize the unhealthy look and lack of vitality.',
        background_detail: 'The background is a stark, empty kitchen or a chaotic, rushed environment, symbolizing neglect of self-care and nourishment.',
        icon: SkippingMealsIcon,
        recoveryHabitId: 'clean_eating',
    },
    {
        id: 'bad_sleep',
        name: 'Late Night Sleep',
        description: 'Inconsistent and insufficient sleep.',
        prompt_detail: 'Visualize the clear impact of chronic sleep deprivation. Prominent dark circles under the eyes, a stressed and weary expression, and dull, tired-looking skin. The eyes are puffy and bloodshot. The lighting is dim and cool, casting long, tired shadows and draining the color from the face, reflecting deep fatigue.',
        background_detail: 'The scene is a dark bedroom illuminated by the harsh glow of a phone screen late at night, conveying a sense of restlessness and poor sleep quality.',
        icon: BadSleepIcon,
        recoveryHabitId: 'good_sleep',
    },
];

export const TIMEFRAMES: Timeframe[] = [
  { id: '21d', name: '21 Days' },
  { id: '3m', name: '3 Months' },
  { id: '6m', name: '6 Months' },
  { id: '1y', name: '1 Year' },
  { id: '5y', name: '5 Years' },
];

export const ART_STYLES: ArtStyle[] = [
    { id: 'anime', name: 'Anime' },
    { id: 'ghibli', name: 'Ghibli Style' },
    { id: 'disney', name: '3D Animation' },
    { id: 'cinematic', name: 'Cinematic' },
];

export const CUSTOM_HABIT_ICON = BotIcon;
