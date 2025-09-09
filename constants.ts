
import type { BadgeInfo, Subject } from './types';

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

export const LEARNING_TOPICS: { [classLevel: string]: Subject[] } = {
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
          prerequisites: ['fractions_6'],
          materials: [
            { id: 'dec_notes_1', name: 'Decimal Points Guide', type: 'PDF', url: '#' }
          ]
        },
        { id: 'geometry_basics_6', name: 'Basic Geometric Ideas', icon: '📐', prerequisites: ['decimals_6'] },
        { id: 'integers_6', name: 'Integers', icon: '➕', prerequisites: ['geometry_basics_6'] },
        { id: 'algebra_intro_6', name: 'Introduction to Algebra', icon: '📝', prerequisites: ['integers_6'] },
      ],
    },
    {
      id: 'science_6',
      name: 'Science',
      icon: '🔬',
      topics: [
        { id: 'components_of_food_6', name: 'Components of Food', icon: '🍎' },
        { 
          id: 'food_tests_6', 
          name: 'Simple Food Tests', 
          icon: '🧪',
          prerequisites: ['components_of_food_6']
        },
        { 
          id: 'balanced_diet_6', 
          name: 'Balanced Diet & Nutrition', 
          icon: '🥗',
          prerequisites: ['components_of_food_6']
        },
        { 
          id: 'food_choices_6', 
          name: 'Making Healthy Food Choices', 
          icon: '🏷️',
          prerequisites: ['balanced_diet_6']
        },
        { 
          id: 'millets_food_miles_6', 
          name: 'Millets & Food Miles', 
          icon: '🌾',
          prerequisites: ['food_choices_6']
        },
      ],
    },
    {
      id: 'sst_6',
      name: 'SST',
      icon: '🗺️',
      topics: [
        { id: 'indus_valley_6', name: 'Indus Valley Civilization', icon: '🏛️' },
        { id: 'vedic_period_6', name: 'The Vedic Period', icon: '📜', prerequisites: ['indus_valley_6'] },
        { id: 'mauryan_empire_6', name: 'The Mauryan Empire', icon: '🦁', prerequisites: ['vedic_period_6'] },
        { id: 'what_is_government_6', name: 'What is Government?', icon: '🏛️' },
        { id: 'understanding_maps_6', name: 'Understanding Maps', icon: '📍', prerequisites: ['what_is_government_6'] },
      ],
    },
    { 
      id: 'english_6', 
      name: 'English', 
      icon: '📚', 
      topics: [
        { id: 'nouns_pronouns_6', name: 'Nouns and Pronouns', icon: '📝' },
        { id: 'verbs_tenses_6', name: 'Verbs and Tenses', icon: '🏃', prerequisites: ['nouns_pronouns_6'] },
        { id: 'reading_comprehension_6', name: 'Reading Comprehension', icon: '📖' },
      ] 
    },
    { id: 'hindi_6', name: 'Hindi', icon: '🙏', topics: [] },
    { 
      id: 'cs_6', 
      name: 'Computer Science', 
      icon: '💻', 
      topics: [
        { id: 'computer_intro_6', name: 'Introduction to Computers', icon: '🖥️' },
        { id: 'ms_word_6', name: 'Working with MS Word', icon: '📄', prerequisites: ['computer_intro_6'] },
        { id: 'scratch_intro_6', name: 'Introduction to Scratch', icon: '🐱', prerequisites: ['ms_word_6'] },
      ]
    },
    {
      id: 'sanskrit_6',
      name: 'Sanskrit',
      icon: '📜',
      topics: [
        { id: 'sanskrit_alphabet_6', name: 'Introduction to Sanskrit Alphabet', icon: 'अ' },
        { id: 'sanskrit_nouns_6', name: 'Basic Nouns (Shabda Roop)', icon: '👦', prerequisites: ['sanskrit_alphabet_6'] },
      ]
    },
    {
      id: 'gk_6',
      name: 'General Knowledge',
      icon: '💡',
      topics: [
        { id: 'indian_states_6', name: 'Indian States and Capitals', icon: '🇮🇳' },
        { id: 'world_wonders_6', name: 'Wonders of the World', icon: '🌍', prerequisites: ['indian_states_6'] },
      ]
    },
    {
      id: 'art_6',
      name: 'Art Education',
      icon: '🎨',
      topics: [
        { id: 'drawing_basics_6', name: 'Basics of Drawing and Shading', icon: '✏️' },
        { id: 'color_theory_6', name: 'Introduction to Color Theory', icon: '🌈', prerequisites: ['drawing_basics_6'] },
      ]
    },
    { id: 'ai_6', name: 'AI', icon: '🤖', topics: [] },
    { id: 'mental_math_6', name: 'Mental Mathematics', icon: '🧠', topics: [] },
    { id: 'olympiad_6', name: 'Olympiad', icon: '🏆', topics: [] },
  ],
  '7': [
    { id: 'math_7', name: 'Mathematics', icon: '🧮', topics: [
      { id: 'integers_7', name: 'Integers', icon: '➕' },
      { id: 'fractions_decimals_7', name: 'Fractions and Decimals', icon: '➗', prerequisites: ['integers_7'] },
      { id: 'simple_equations_7', name: 'Simple Equations', icon: '🟰', prerequisites: ['fractions_decimals_7']},
      { id: 'lines_angles_7', name: 'Lines and Angles', icon: '📏' },
      { id: 'triangles_7', name: 'The Triangle and its Properties', icon: '🔺', prerequisites: ['lines_angles_7'] },
    ]},
    { id: 'physics_7', name: 'Physics', icon: '⚛️', topics: [
      { id: 'heat_7', name: 'Heat', icon: '🔥' },
      { id: 'motion_time_7', name: 'Motion and Time', icon: '⏱️', prerequisites: ['heat_7'] },
      { id: 'electric_current_7', name: 'Electric Current and its Effects', icon: '⚡', prerequisites: ['motion_time_7'] },
    ]},
    { id: 'chemistry_7', name: 'Chemistry', icon: '🧪', topics: [
      { id: 'fibre_to_fabric_7', name: 'Fibre to Fabric', icon: '🧶' },
      { id: 'acids_bases_salts_7', name: 'Acids, Bases, and Salts', icon: '⚗️', prerequisites: ['fibre_to_fabric_7'] },
      { id: 'physical_chemical_changes_7', name: 'Physical and Chemical Changes', icon: '💥', prerequisites: ['acids_bases_salts_7'] },
    ]},
    { id: 'biology_7', name: 'Biology', icon: '🧬', topics: [
      { id: 'nutrition_plants_7', name: 'Nutrition in Plants', icon: '🌱' },
      { id: 'nutrition_animals_7', name: 'Nutrition in Animals', icon: '🦁', prerequisites: ['nutrition_plants_7'] },
      { id: 'weather_climate_7', name: 'Weather, Climate & Adaptations', icon: '🌦️' },
      { id: 'respiration_organisms_7', name: 'Respiration in Organisms', icon: '👃', prerequisites: ['nutrition_animals_7'] },
    ]},
    { id: 'sst_7', name: 'Social Studies', icon: '🗺️', topics: [
      { id: 'delhi_sultanate_7', name: 'The Delhi Sultanate', icon: '🏰' },
      { id: 'mughal_empire_7', name: 'The Mughal Empire', icon: '🕌', prerequisites: ['delhi_sultanate_7'] },
      { id: 'our_environment_7', name: 'Our Environment', icon: '🌍' },
      { id: 'role_of_government_health_7', name: 'Role of the Government in Health', icon: '🏥', prerequisites: ['our_environment_7'] },
    ]}
  ],
  '8': [
     { id: 'math_8', name: 'Mathematics', icon: '🧮', topics: [
      { id: 'rational_numbers_8', name: 'Rational Numbers', icon: '➗' },
      { id: 'linear_equations_8', name: 'Linear Equations in One Variable', icon: '📈', prerequisites: ['rational_numbers_8'] },
      { id: 'squares_roots_8', name: 'Squares and Square Roots', icon: '√', prerequisites: ['linear_equations_8'] },
      { id: 'algebraic_expressions_8', name: 'Algebraic Expressions and Identities', icon: '💡', prerequisites: ['squares_roots_8'] },
      { id: 'mensuration_8', name: 'Mensuration', icon: '📐', prerequisites: ['algebraic_expressions_8'] },
    ]},
     { id: 'science_8', name: 'Science', icon: '🔬', topics: [
      { id: 'cell_structure_8', name: 'Cell Structure and Functions', icon: '🔬' },
      { id: 'microorganisms_8', name: 'Microorganisms: Friend and Foe', icon: '🦠', prerequisites: ['cell_structure_8'] },
      { id: 'force_pressure_8', name: 'Force and Pressure', icon: '💪' },
      { id: 'light_8', name: 'Light', icon: '💡', prerequisites: ['force_pressure_8'] },
      { id: 'chemical_effects_8', name: 'Chemical Effects of Electric Current', icon: '🧪', prerequisites: ['light_8'] },
    ]},
     { id: 'sst_8', name: 'Social Studies', icon: '🗺️', topics: [
      { id: 'trade_to_territory_8', name: 'From Trade to Territory', icon: '🗺️' },
      { id: 'indian_constitution_8', name: 'The Indian Constitution', icon: '📜' },
      { id: 'understanding_secularism_8', name: 'Understanding Secularism', icon: '🕊️', prerequisites: ['indian_constitution_8'] },
      { id: 'industries_8', name: 'Industries', icon: '🏭' },
      { id: 'human_resources_8', name: 'Human Resources', icon: '🧑‍🤝‍🧑', prerequisites: ['industries_8'] },
    ]},
  ],
  '9': [
    { id: 'math_9', name: 'Mathematics', icon: '🧮', topics: [
      { id: 'number_systems_9', name: 'Number Systems', icon: '🧮' },
      { id: 'polynomials_9', name: 'Polynomials', icon: '𝑥²', prerequisites: ['number_systems_9'] },
      { id: 'coordinate_geometry_9', name: 'Coordinate Geometry', icon: '🗺️' },
      { id: 'linear_equations_two_variables_9', name: 'Linear Equations in Two Variables', icon: '📈', prerequisites: ['polynomials_9'] },
      { id: 'circles_9', name: 'Circles', icon: '⭕' },
    ]},
    { id: 'science_9', name: 'Science', icon: '🔬', topics: [
      { id: 'matter_surroundings_9', name: 'Matter in Our Surroundings', icon: '🧊' },
      { id: 'atoms_molecules_9', name: 'Atoms and Molecules', icon: '⚛️', prerequisites: ['matter_surroundings_9'] },
      { id: 'fundamental_unit_life_9', name: 'The Fundamental Unit of Life', icon: '🧬' },
      { id: 'tissues_9', name: 'Tissues', icon: '🌿', prerequisites: ['fundamental_unit_life_9'] },
      { id: 'motion_9', name: 'Motion', icon: '🏃' },
      { id: 'force_laws_9', name: 'Force and Laws of Motion', icon: '⚖️', prerequisites: ['motion_9'] },
      { id: 'gravitation_9', name: 'Gravitation', icon: '🌍', prerequisites: ['force_laws_9'] },
    ]},
    { id: 'sst_9', name: 'Social Studies', icon: '🗺️', topics: [
      { id: 'french_revolution_9', name: 'The French Revolution', icon: '🇫🇷' },
      { id: 'socialism_in_europe_9', name: 'Socialism in Europe and the Russian Revolution', icon: '🇷🇺', prerequisites: ['french_revolution_9'] },
      { id: 'physical_features_india_9', name: 'Physical Features of India', icon: '🏞️' },
      { id: 'what_is_democracy_9', name: 'What is Democracy? Why Democracy?', icon: '🗳️' },
    ]}
  ],
  '10': [
    { id: 'math_10', name: 'Mathematics', icon: '🧮', topics: [
      { id: 'real_numbers_10', name: 'Real Numbers', icon: 'π' },
      { id: 'polynomials_10', name: 'Polynomials', icon: '𝑥²', prerequisites: ['real_numbers_10'] },
      { id: 'quadratic_equations_10', name: 'Quadratic Equations', icon: 'ax²+bx+c', prerequisites: ['polynomials_10'] },
      { id: 'arithmetic_progressions_10', name: 'Arithmetic Progressions', icon: '📊', prerequisites: ['quadratic_equations_10'] },
      { id: 'trigonometry_10', name: 'Introduction to Trigonometry', icon: '🔺' },
      { id: 'probability_10', name: 'Probability', icon: '🎲' },
    ]},
    { id: 'science_10', name: 'Science', icon: '🔬', topics: [
      { id: 'chemical_reactions_10', name: 'Chemical Reactions and Equations', icon: '💥' },
      { id: 'acids_bases_salts_10', name: 'Acids, Bases and Salts', icon: '⚗️', prerequisites: ['chemical_reactions_10'] },
      { id: 'carbon_compounds_10', name: 'Carbon and its Compounds', icon: '💎', prerequisites: ['acids_bases_salts_10'] },
      { id: 'life_processes_10', name: 'Life Processes', icon: '❤️' },
      { id: 'reproduction_10', name: 'How do Organisms Reproduce?', icon: '🌱', prerequisites: ['life_processes_10'] },
      { id: 'light_reflection_10', name: 'Light - Reflection and Refraction', icon: '💡' },
      { id: 'electricity_10', name: 'Electricity', icon: '⚡', prerequisites: ['light_reflection_10'] },
    ]},
    { id: 'sst_10', name: 'Social Studies', icon: '🗺️', topics: [
      { id: 'nationalism_europe_10', name: 'The Rise of Nationalism in Europe', icon: '🇪🇺' },
      { id: 'nationalism_india_10', name: 'Nationalism in India', icon: '🇮🇳', prerequisites: ['nationalism_europe_10'] },
      { id: 'resources_development_10', name: 'Resources and Development', icon: '🏞️' },
      { id: 'sectors_indian_economy_10', name: 'Sectors of the Indian Economy', icon: '📈' },
      { id: 'power_sharing_10', name: 'Power Sharing', icon: '🤝' },
    ]}
  ],
  '11': [
    { id: 'math_11', name: 'Mathematics', icon: '🧮', topics: [
      { id: 'sets_11', name: 'Sets', icon: 'U' },
      { id: 'relations_functions_11', name: 'Relations and Functions', icon: 'ƒ(x)', prerequisites: ['sets_11'] },
      { id: 'trigonometric_functions_11', name: 'Trigonometric Functions', icon: '🔺', prerequisites: ['relations_functions_11'] },
      { id: 'linear_inequalities_11', name: 'Linear Inequalities', icon: '>', prerequisites: ['trigonometric_functions_11'] },
      { id: 'sequences_series_11', name: 'Sequences and Series', icon: '📊', prerequisites: ['linear_inequalities_11'] },
    ]},
    { id: 'physics_11', name: 'Physics', icon: '⚛️', topics: [
      { id: 'units_measurement_11', name: 'Units and Measurement', icon: '📏' },
      { id: 'motion_straight_line_11', name: 'Motion in a Straight Line', icon: '🚗', prerequisites: ['units_measurement_11'] },
      { id: 'laws_motion_11', name: 'Laws of Motion', icon: '🍎', prerequisites: ['motion_straight_line_11'] },
      { id: 'work_energy_power_11', name: 'Work, Energy and Power', icon: '⚡', prerequisites: ['laws_motion_11'] },
      { id: 'thermodynamics_11', name: 'Thermodynamics', icon: '🔥', prerequisites: ['work_energy_power_11'] },
    ]},
    { id: 'chemistry_11', name: 'Chemistry', icon: '🧪', topics: [
      { id: 'basic_concepts_chem_11', name: 'Some Basic Concepts of Chemistry', icon: '🧪' },
      { id: 'structure_atom_11', name: 'Structure of Atom', icon: '⚛️', prerequisites: ['basic_concepts_chem_11'] },
      { id: 'chemical_bonding_11', name: 'Chemical Bonding and Molecular Structure', icon: '🔗', prerequisites: ['structure_atom_11'] },
      { id: 'states_of_matter_11', name: 'States of Matter', icon: '💨', prerequisites: ['chemical_bonding_11'] },
      { id: 'organic_chem_basics_11', name: 'Organic Chemistry – Some Basic Principles and Techniques', icon: '⌬', prerequisites: ['states_of_matter_11'] },
    ]},
    { id: 'biology_11', name: 'Biology', icon: '🧬', topics: [
      { id: 'living_world_11', name: 'The Living World', icon: '🌍' },
      { id: 'plant_kingdom_11', name: 'Plant Kingdom', icon: '🌿', prerequisites: ['living_world_11'] },
      { id: 'animal_kingdom_11', name: 'Animal Kingdom', icon: '🦓', prerequisites: ['plant_kingdom_11'] },
      { id: 'cell_cycle_11', name: 'Cell Cycle and Cell Division', icon: '➗' },
      { id: 'human_physiology_11', name: 'Breathing and Exchange of Gases', icon: '👃', prerequisites: ['cell_cycle_11'] },
    ]}
  ],
  '12': [
    { id: 'math_12', name: 'Mathematics', icon: '🧮', topics: [
      { id: 'relations_functions_12', name: 'Relations and Functions', icon: 'ƒ(x)' },
      { id: 'inverse_trig_12', name: 'Inverse Trigonometric Functions', icon: 'sin⁻¹', prerequisites: ['relations_functions_12'] },
      { id: 'matrices_12', name: 'Matrices', icon: '🔢' },
      { id: 'determinants_12', name: 'Determinants', icon: '🔲', prerequisites: ['matrices_12'] },
      { id: 'continuity_differentiability_12', name: 'Continuity and Differentiability', icon: '📈', prerequisites: ['inverse_trig_12'] },
      { id: 'integrals_12', name: 'Integrals', icon: '∫', prerequisites: ['continuity_differentiability_12'] },
      { id: 'probability_12', name: 'Probability', icon: '🎲' },
    ]},
    { id: 'physics_12', name: 'Physics', icon: '⚛️', topics: [
      { id: 'electric_charges_12', name: 'Electric Charges and Fields', icon: '⚡' },
      { id: 'current_electricity_12', name: 'Current Electricity', icon: '💡', prerequisites: ['electric_charges_12'] },
      { id: 'magnetism_matter_12', name: 'Magnetism and Matter', icon: '🧲', prerequisites: ['current_electricity_12'] },
      { id: 'electromagnetic_induction_12', name: 'Electromagnetic Induction', icon: '🔄', prerequisites: ['magnetism_matter_12'] },
      { id: 'ray_optics_12', name: 'Ray Optics and Optical Instruments', icon: '렌' },
      { id: 'semiconductor_electronics_12', name: 'Semiconductor Electronics', icon: '📲', prerequisites: ['ray_optics_12'] },
    ]},
    { id: 'chemistry_12', name: 'Chemistry', icon: '🧪', topics: [
      { id: 'solutions_12', name: 'Solutions', icon: '⚗️' },
      { id: 'electrochemistry_12', name: 'Electrochemistry', icon: '🔋', prerequisites: ['solutions_12'] },
      { id: 'chemical_kinetics_12', name: 'Chemical Kinetics', icon: '⏱️', prerequisites: ['electrochemistry_12'] },
      { id: 'd_f_block_12', name: 'The d-and f-Block Elements', icon: '⛓️' },
      { id: 'coordination_compounds_12', name: 'Coordination Compounds', icon: '💠', prerequisites: ['d_f_block_12'] },
      { id: 'alcohols_phenols_ethers_12', name: 'Alcohols, Phenols and Ethers', icon: '⚗️' },
      { id: 'biomolecules_12', name: 'Biomolecules', icon: '🧬', prerequisites: ['alcohols_phenols_ethers_12'] },
    ]},
    { id: 'biology_12', name: 'Biology', icon: '🧬', topics: [
      { id: 'reproduction_organisms_12', name: 'Reproduction in Organisms', icon: '🌱' },
      { id: 'human_reproduction_12', name: 'Human Reproduction', icon: '👶', prerequisites: ['reproduction_organisms_12'] },
      { id: 'inheritance_variation_12', name: 'Principles of Inheritance and Variation', icon: '👨‍👩‍👧‍👦' },
      { id: 'molecular_basis_inheritance_12', name: 'Molecular Basis of Inheritance', icon: '🧬', prerequisites: ['inheritance_variation_12'] },
      { id: 'biotechnology_12', name: 'Biotechnology: Principles and Processes', icon: '🔬' },
      { id: 'ecosystems_12', name: 'Ecosystems', icon: '🏞️' },
    ]}
  ],
};
