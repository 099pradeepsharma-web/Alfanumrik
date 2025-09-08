import type { BadgeInfo } from './types';

export const BADGES: { [id: string]: BadgeInfo } = {
  'first_steps': {
    name: 'First Steps',
    description: 'Completed your first learning module.',
    icon: '👟',
  },
  'quiz_whiz': {
    name: 'Quiz Whiz',
    description: 'Aced your first quiz with a perfect score.',
    icon: '🧠',
  },
  'daily_streak': {
    name: 'Daily Challenger',
    description: 'Completed a daily challenge.',
    icon: '🔥',
  },
  'exam_ace': {
    name: 'Exam Ace',
    description: 'Scored 90% or higher on an exam.',
    icon: '🏆',
  },
  'subject_champion': {
    name: 'Subject Champion',
    description: 'Mastered all topics in a subject.',
    icon: '🏅',
  },
};

export const CLASS_LEVELS = ['6', '7', '8', '9', '10', '11', '12'];

export const LEARNING_TOPICS: { [classLevel: string]: any[] } = {
  '6': [
    {
      id: 'math_6',
      name: 'Mathematics',
      icon: '🧮',
      topics: [
        { 
          id: 'fractions_6', 
          name: 'Introduction to Fractions', 
          icon: '➗',
          materials: [
            { id: 'frac_notes_1', name: 'Fractions Explained (PDF)', type: 'PDF', url: '#' },
            { id: 'frac_ws_1', name: 'Practice Worksheet 1', type: 'Worksheet', url: '#' }
          ]
        },
        { 
          id: 'decimals_6', 
          name: 'Understanding Decimals', 
          icon: '🔢',
          materials: [
            { id: 'dec_notes_1', name: 'Decimal Points Guide', type: 'PDF', url: '#' }
          ]
        },
        { id: 'geometry_basics_6', name: 'Basic Geometric Ideas', icon: '📐' },
      ],
    },
    {
      id: 'science_6',
      name: 'Science',
      icon: '🔬',
      topics: [
        { id: 'solar_system_6', name: 'The Solar System', icon: '🪐' },
        { 
          id: 'living_organisms_6', 
          name: 'Living Organisms & Surroundings', 
          icon: '🦋',
          materials: [
            { id: 'lo_notes_1', name: 'Habitats and Adaptations', type: 'PDF', url: '#' }
          ]
        },
        { id: 'food_components_6', name: 'Components of Food', icon: '🍎' },
      ],
    },
    {
      id: 'sst_6',
      name: 'SST',
      icon: '🗺️',
      topics: [
        { id: 'indus_valley_6', name: 'Indus Valley Civilization', icon: '🏛️' },
        { id: 'ancient_egypt_6', name: 'Ancient Egypt', icon: '🏺' },
      ],
    },
    { id: 'english_6', name: 'English', icon: '📚', topics: [] },
    { id: 'hindi_6', name: 'Hindi', icon: '🙏', topics: [] },
    { id: 'ai_6', name: 'AI', icon: '🤖', topics: [] },
    { id: 'cs_6', name: 'Computer Science', icon: '💻', topics: [] },
    { id: 'mental_math_6', name: 'Mental Mathematics', icon: '🧠', topics: [] },
    { id: 'olympiad_6', name: 'Olympiad', icon: '🏆', topics: [] },
  ],
  '7': [
    { id: 'integers_7', name: 'Integers', icon: '➕' },
    { id: 'algebra_basics_7', name: 'Basics of Algebra', icon: '🧮' },
    { id: 'lines_angles_7', name: 'Lines and Angles', icon: '📏' },
    { id: 'plant_cells_7', name: 'Nutrition in Plants', icon: '🌱' },
    { id: 'acids_bases_7', name: 'Acids, Bases, and Salts', icon: '⚗️' },
    { id: 'weather_climate_7', name: 'Weather, Climate & Adaptations', icon: '🌦️' },
    { id: 'delhi_sultanate_7', name: 'The Delhi Sultanate', icon: '🏰' },
    { id: 'mughal_empire_7', name: 'The Mughal Empire', icon: '🕌' },
  ],
  '8': [
    { id: 'linear_equations_8', name: 'Linear Equations', icon: '📈' },
    { id: 'squares_roots_8', name: 'Squares and Square Roots', icon: '√' },
    { id: 'cell_structure_8', name: 'Cell Structure and Functions', icon: '🔬' },
    { id: 'microorganisms_8', name: 'Microorganisms: Friend and Foe', icon: '🦠' },
    { id: 'chemical_reactions_8', name: 'Chemical Effects of Electric Current', icon: '🧪' },
    { id: 'indian_constitution_8', name: 'The Indian Constitution', icon: '📜' },
    { id: 'trade_to_territory_8', name: 'From Trade to Territory', icon: '🗺️' },
  ],
  '9': [
    { id: 'number_systems_9', name: 'Number Systems', icon: '🧮' },
    { id: 'polynomials_9', name: 'Polynomials', icon: '𝑥²' },
    { id: 'motion_9', name: 'Motion', icon: '🏃' },
    { id: 'force_laws_9', name: 'Force and Laws of Motion', icon: '⚖️' },
    { id: 'matter_surroundings_9', name: 'Matter in Our Surroundings', icon: '🧊' },
    { id: 'atoms_molecules_9', name: 'Atoms and Molecules', icon: '⚛️' },
    { id: 'fundamental_unit_life_9', name: 'The Fundamental Unit of Life', icon: '🧬' },
    { id: 'french_revolution_9', name: 'The French Revolution', icon: '🇫🇷' },
  ],
  '10': [
    { id: 'real_numbers_10', name: 'Real Numbers', icon: 'π' },
    { id: 'quadratic_equations_10', name: 'Quadratic Equations', icon: 'ax²+bx+c' },
    { id: 'trigonometry_10', name: 'Introduction to Trigonometry', icon: '🔺' },
    { id: 'light_reflection_10', name: 'Light - Reflection and Refraction', icon: '💡' },
    { id: 'electricity_10', name: 'Electricity', icon: '⚡' },
    { id: 'carbon_compounds_10', name: 'Carbon and its Compounds', icon: '💎' },
    { id: 'life_processes_10', name: 'Life Processes', icon: '❤️' },
    { id: 'nationalism_india_10', name: 'Nationalism in India', icon: '🇮🇳' },
  ],
  '11': [
    { id: 'sets_11', name: 'Sets', icon: 'U' },
    { id: 'relations_functions_11', name: 'Relations and Functions', icon: 'ƒ(x)' },
    { id: 'kinematics_11', name: 'Kinematics', icon: '🚗' },
    { id: 'laws_motion_11', name: 'Laws of Motion', icon: '🍎' },
    { id: 'basic_concepts_chem_11', name: 'Some Basic Concepts of Chemistry', icon: '🧪' },
    { id: 'structure_atom_11', name: 'Structure of Atom', icon: '⚛️' },
    { id: 'living_world_11', name: 'The Living World', icon: '🌍' },
  ],
  '12': [
    { id: 'inverse_trig_12', name: 'Inverse Trigonometric Functions', icon: 'sin⁻¹' },
    { id: 'matrices_12', name: 'Matrices', icon: '🔢' },
    { id: 'electric_charges_12', name: 'Electric Charges and Fields', icon: '⚡' },
    { id: 'electrostatic_potential_12', name: 'Electrostatic Potential', icon: '🔋' },
    { id: 'solid_state_12', name: 'The Solid State', icon: '🧊' },
    { id: 'solutions_12', name: 'Solutions', icon: '⚗️' },
    { id: 'reproduction_organisms_12', name: 'Reproduction in Organisms', icon: '🌱' },
  ],
};

// Mock data for Teacher and Parent dashboards
export const MOCKED_STUDENTS = [
    { id: 'student1', name: 'Rohan Sharma', level: 4, points: 320, lastActivity: '2 hours ago', weaknesses: ['Algebraic Equations'], strengths: ['Geometry', 'Fractions'] },
    { id: 'student2', name: 'Priya Patel', level: 5, points: 450, lastActivity: '1 day ago', weaknesses: ['Chemical Formulas'], strengths: ['Biology', 'Physics'] },
    { id: 'student3', name: 'Amit Singh', level: 3, points: 210, lastActivity: '3 days ago', weaknesses: ['Historical Dates'], strengths: ['Geography'] },
];

export const MOCKED_CHILDREN = [
    { id: 'child1', name: 'Ananya Verma', level: 3, points: 280, progress: 65, lastActivity: 'Yesterday', weaknesses: ['Verb Tenses'], strengths: ['Vocabulary'] },
    { id: 'child2', name: 'Vikram Rao', level: 4, points: 350, progress: 80, lastActivity: 'Today', weaknesses: ['Geometry Proofs'], strengths: ['Algebra'] },
];