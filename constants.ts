
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
      { id: 'data_handling_7', name: 'Data Handling', icon: '📊' },
      { id: 'simple_equations_7', name: 'Simple Equations', icon: '🟰', prerequisites: ['fractions_decimals_7']},
      { id: 'lines_angles_7', name: 'Lines and Angles', icon: '📏' },
      { id: 'triangles_7', name: 'The Triangle and its Properties', icon: '🔺', prerequisites: ['lines_angles_7'] },
      { id: 'congruence_triangles_7', name: 'Congruence of Triangles', icon: '≅', prerequisites: ['triangles_7'] },
      { id: 'comparing_quantities_7', name: 'Comparing Quantities', icon: '%' },
    ]},
    { id: 'science_7', name: 'Science', icon: '🔬', topics: [
      { id: 'nutrition_plants_7', name: 'Nutrition in Plants', icon: '🌱' },
      { id: 'nutrition_animals_7', name: 'Nutrition in Animals', icon: '🦁', prerequisites: ['nutrition_plants_7'] },
      { id: 'fibre_to_fabric_7', name: 'Fibre to Fabric', icon: '🧶' },
      { id: 'heat_7', name: 'Heat', icon: '🔥' },
      { id: 'acids_bases_salts_7', name: 'Acids, Bases, and Salts', icon: '⚗️', prerequisites: ['fibre_to_fabric_7'] },
      { id: 'physical_chemical_changes_7', name: 'Physical and Chemical Changes', icon: '💥', prerequisites: ['acids_bases_salts_7'] },
      { id: 'weather_climate_7', name: 'Weather, Climate & Adaptations', icon: '🌦️' },
      { id: 'motion_time_7', name: 'Motion and Time', icon: '⏱️' },
      { id: 'electric_current_7', name: 'Electric Current and its Effects', icon: '⚡', prerequisites: ['motion_time_7'] },
      { id: 'respiration_organisms_7', name: 'Respiration in Organisms', icon: '👃', prerequisites: ['nutrition_animals_7'] },
    ]},
    { id: 'sst_7', name: 'Social Studies', icon: '🗺️', topics: [
      { id: 'tracing_changes_7', name: 'Tracing Changes Through A Thousand Years', icon: '📜' },
      { id: 'delhi_sultanate_7', name: 'The Delhi Sultanate', icon: '🏰', prerequisites: ['tracing_changes_7'] },
      { id: 'mughal_empire_7', name: 'The Mughal Empire', icon: '🕌', prerequisites: ['delhi_sultanate_7'] },
      { id: 'our_environment_7', name: 'Our Environment', icon: '🌍' },
      { id: 'role_of_government_health_7', name: 'Role of the Government in Health', icon: '🏥' },
      { id: 'markets_around_us_7', name: 'Markets Around Us', icon: '🛒' },
    ]},
    { id: 'english_7', name: 'English', icon: '📚', topics: [
      { id: 'three_questions_7', name: 'Three Questions (Story)', icon: '👑' },
      { id: 'reported_speech_7', name: 'Reported Speech', icon: '💬', prerequisites: ['three_questions_7'] },
      { id: 'active_passive_voice_7', name: 'Active and Passive Voice', icon: '🗣️' },
    ]},
    { id: 'hindi_7', name: 'Hindi', icon: '🙏', topics: [
        { id: 'hum_panchi_unmukt_gagan_ke_7', name: 'हम पंछी उन्मुक्त गगन के', icon: '🐦' },
        { id: 'viseshan_7', name: 'विशेषण (Adjectives)', icon: '📝', prerequisites: ['hum_panchi_unmukt_gagan_ke_7'] },
    ]},
    { id: 'cs_7', name: 'Computer Science', icon: '💻', topics: [
      { id: 'number_system_7', name: 'Number System', icon: '🔢' },
      { id: 'html_intro_7', name: 'Introduction to HTML', icon: '🌐', prerequisites: ['number_system_7'] },
    ]},
  ],
  '8': [
     { id: 'math_8', name: 'Mathematics', icon: '🧮', topics: [
      { id: 'rational_numbers_8', name: 'Rational Numbers', icon: '➗' },
      { id: 'linear_equations_8', name: 'Linear Equations in One Variable', icon: '📈', prerequisites: ['rational_numbers_8'] },
      { id: 'understanding_quadrilaterals_8', name: 'Understanding Quadrilaterals', icon: '⬟' },
      { id: 'squares_roots_8', name: 'Squares and Square Roots', icon: '√', prerequisites: ['linear_equations_8'] },
      { id: 'cubes_roots_8', name: 'Cubes and Cube Roots', icon: '∛', prerequisites: ['squares_roots_8'] },
      { id: 'algebraic_expressions_8', name: 'Algebraic Expressions and Identities', icon: '💡', prerequisites: ['cubes_roots_8'] },
      { id: 'mensuration_8', name: 'Mensuration', icon: '📐', prerequisites: ['algebraic_expressions_8'] },
    ]},
     { id: 'science_8', name: 'Science', icon: '🔬', topics: [
      { id: 'crop_production_8', name: 'Crop Production and Management', icon: '🌾' },
      { id: 'microorganisms_8', name: 'Microorganisms: Friend and Foe', icon: '🦠', prerequisites: ['crop_production_8'] },
      { id: 'coal_petroleum_8', name: 'Coal and Petroleum', icon: '⛽' },
      { id: 'cell_structure_8', name: 'Cell Structure and Functions', icon: '🔬' },
      { id: 'force_pressure_8', name: 'Force and Pressure', icon: '💪' },
      { id: 'friction_8', name: 'Friction', icon: '🤚', prerequisites: ['force_pressure_8'] },
      { id: 'light_8', name: 'Light', icon: '💡' },
      { id: 'chemical_effects_8', name: 'Chemical Effects of Electric Current', icon: '🧪' },
    ]},
     { id: 'sst_8', name: 'Social Studies', icon: '🗺️', topics: [
      { id: 'trade_to_territory_8', name: 'From Trade to Territory', icon: '🗺️' },
      { id: 'ruling_the_countryside_8', name: 'Ruling the Countryside', icon: '🏞️', prerequisites: ['trade_to_territory_8'] },
      { id: 'indian_constitution_8', name: 'The Indian Constitution', icon: '📜' },
      { id: 'understanding_secularism_8', name: 'Understanding Secularism', icon: '🕊️', prerequisites: ['indian_constitution_8'] },
      { id: 'industries_8', name: 'Industries', icon: '🏭' },
      { id: 'human_resources_8', name: 'Human Resources', icon: '🧑‍🤝‍🧑', prerequisites: ['industries_8'] },
    ]},
    { id: 'english_8', name: 'English', icon: '📚', topics: [
        { id: 'best_christmas_present_8', name: 'The Best Christmas Present in the World', icon: '🎁' },
        { id: 'tsunami_8', name: 'The Tsunami', icon: '🌊', prerequisites: ['best_christmas_present_8'] },
        { id: 'modals_8', name: 'Modals', icon: '📝' },
    ]},
    { id: 'hindi_8', name: 'Hindi', icon: '🙏', topics: [
        { id: 'dhwani_8', name: 'ध्वनि (कविता)', icon: '🔔' },
        { id: 'lakh_ki_chudiyan_8', name: 'लाख की चूड़ियाँ', icon: '💎', prerequisites: ['dhwani_8'] },
    ]},
    { id: 'cs_8', name: 'Computer Science', icon: '💻', topics: [
        { id: 'python_intro_8', name: 'Introduction to Python', icon: '🐍' },
        { id: 'computer_networks_8', name: 'Computer Networks', icon: '🌐', prerequisites: ['python_intro_8'] },
    ]},
  ],
  '9': [
    { id: 'math_9', name: 'Mathematics', icon: '🧮', topics: [
      { id: 'number_systems_9', name: 'Number Systems', icon: '🧮' },
      { id: 'polynomials_9', name: 'Polynomials', icon: '𝑥²', prerequisites: ['number_systems_9'] },
      { id: 'coordinate_geometry_9', name: 'Coordinate Geometry', icon: '🗺️' },
      { id: 'linear_equations_two_variables_9', name: 'Linear Equations in Two Variables', icon: '📈', prerequisites: ['polynomials_9'] },
      { id: 'euclids_geometry_9', name: 'Introduction to Euclid\'s Geometry', icon: '📐' },
      { id: 'circles_9', name: 'Circles', icon: '⭕' },
      { id: 'surface_areas_volumes_9', name: 'Surface Areas and Volumes', icon: '🧊' },
      { id: 'statistics_9', name: 'Statistics', icon: '📊' },
    ]},
    { id: 'science_9', name: 'Science', icon: '🔬', topics: [
      { id: 'matter_surroundings_9', name: 'Matter in Our Surroundings', icon: '🧊' },
      { id: 'atoms_molecules_9', name: 'Atoms and Molecules', icon: '⚛️', prerequisites: ['matter_surroundings_9'] },
      { id: 'fundamental_unit_life_9', name: 'The Fundamental Unit of Life', icon: '🧬' },
      { id: 'tissues_9', name: 'Tissues', icon: '🌿', prerequisites: ['fundamental_unit_life_9'] },
      { id: 'motion_9', name: 'Motion', icon: '🏃' },
      { id: 'force_laws_9', name: 'Force and Laws of Motion', icon: '⚖️', prerequisites: ['motion_9'] },
      { id: 'gravitation_9', name: 'Gravitation', icon: '🌍', prerequisites: ['force_laws_9'] },
      { id: 'work_energy_9', name: 'Work and Energy', icon: '⚡', prerequisites: ['gravitation_9'] },
      { id: 'natural_resources_9', name: 'Natural Resources', icon: '🏞️' },
    ]},
    { id: 'sst_9', name: 'Social Studies', icon: '🗺️', topics: [
      { id: 'french_revolution_9', name: 'The French Revolution', icon: '🇫🇷' },
      { id: 'socialism_in_europe_9', name: 'Socialism in Europe and the Russian Revolution', icon: '🇷🇺', prerequisites: ['french_revolution_9'] },
      { id: 'nazism_9', name: 'Nazism and the Rise of Hitler', icon: '🇩🇪', prerequisites: ['socialism_in_europe_9'] },
      { id: 'physical_features_india_9', name: 'Physical Features of India', icon: '🏞️' },
      { id: 'drainage_9', name: 'Drainage', icon: '💧', prerequisites: ['physical_features_india_9'] },
      { id: 'what_is_democracy_9', name: 'What is Democracy? Why Democracy?', icon: '🗳️' },
      { id: 'electoral_politics_9', name: 'Electoral Politics', icon: '✔️', prerequisites: ['what_is_democracy_9'] },
    ]},
    { id: 'english_9', name: 'English', icon: '📚', topics: [
        { id: 'the_fun_they_had_9', name: 'The Fun They Had', icon: '🤖' },
        { id: 'the_road_not_taken_9', name: 'The Road Not Taken (Poem)', icon: '🛣️' },
        { id: 'tenses_revisited_9', name: 'Tenses Revisited', icon: '🕒', prerequisites: ['the_fun_they_had_9'] },
    ]},
    { id: 'it_9', name: 'Information Technology', icon: '💻', topics: [
        { id: 'communication_skills_9', name: 'Communication Skills', icon: '🗣️' },
        { id: 'digital_documentation_9', name: 'Digital Documentation (Advanced)', icon: '📝', prerequisites: ['communication_skills_9'] },
    ]}
  ],
  '10': [
    { id: 'math_10', name: 'Mathematics', icon: '🧮', topics: [
      { id: 'real_numbers_10', name: 'Real Numbers', icon: 'π' },
      { id: 'polynomials_10', name: 'Polynomials', icon: '𝑥²', prerequisites: ['real_numbers_10'] },
      { id: 'pair_linear_equations_10', name: 'Pair of Linear Equations in Two Variables', icon: '📊', prerequisites: ['polynomials_10'] },
      { id: 'quadratic_equations_10', name: 'Quadratic Equations', icon: 'ax²+bx+c', prerequisites: ['pair_linear_equations_10'] },
      { id: 'arithmetic_progressions_10', name: 'Arithmetic Progressions', icon: '📈', prerequisites: ['quadratic_equations_10'] },
      { id: 'triangles_10', name: 'Triangles', icon: '🔺' },
      { id: 'trigonometry_10', name: 'Introduction to Trigonometry', icon: '📐', prerequisites: ['triangles_10'] },
      { id: 'probability_10', name: 'Probability', icon: '🎲' },
    ]},
    { id: 'science_10', name: 'Science', icon: '🔬', topics: [
      { id: 'chemical_reactions_10', name: 'Chemical Reactions and Equations', icon: '💥' },
      { id: 'acids_bases_salts_10', name: 'Acids, Bases and Salts', icon: '⚗️', prerequisites: ['chemical_reactions_10'] },
      { id: 'metals_nonmetals_10', name: 'Metals and Non-metals', icon: '🔩' },
      { id: 'carbon_compounds_10', name: 'Carbon and its Compounds', icon: '💎', prerequisites: ['metals_nonmetals_10'] },
      { id: 'life_processes_10', name: 'Life Processes', icon: '❤️' },
      { id: 'reproduction_10', name: 'How do Organisms Reproduce?', icon: '🌱', prerequisites: ['life_processes_10'] },
      { id: 'heredity_evolution_10', name: 'Heredity and Evolution', icon: '🧬', prerequisites: ['reproduction_10'] },
      { id: 'light_reflection_10', name: 'Light - Reflection and Refraction', icon: '💡' },
      { id: 'human_eye_10', name: 'The Human Eye and the Colourful World', icon: '👁️', prerequisites: ['light_reflection_10'] },
      { id: 'electricity_10', name: 'Electricity', icon: '⚡' },
      { id: 'magnetic_effects_10', name: 'Magnetic Effects of Electric Current', icon: '🧲', prerequisites: ['electricity_10'] },
    ]},
    { id: 'sst_10', name: 'Social Studies', icon: '🗺️', topics: [
      { id: 'nationalism_europe_10', name: 'The Rise of Nationalism in Europe', icon: '🇪🇺' },
      { id: 'nationalism_india_10', name: 'Nationalism in India', icon: '🇮🇳', prerequisites: ['nationalism_europe_10'] },
      { id: 'making_global_world_10', name: 'The Making of a Global World', icon: '🌍' },
      { id: 'resources_development_10', name: 'Resources and Development', icon: '🏞️' },
      { id: 'agriculture_10', name: 'Agriculture', icon: '🌾', prerequisites: ['resources_development_10'] },
      { id: 'power_sharing_10', name: 'Power Sharing', icon: '🤝' },
      { id: 'federalism_10', name: 'Federalism', icon: '🏛️', prerequisites: ['power_sharing_10'] },
      { id: 'sectors_indian_economy_10', name: 'Sectors of the Indian Economy', icon: '📈' },
    ]},
    { id: 'english_10', name: 'English', icon: '📚', topics: [
        { id: 'letter_to_god_10', name: 'A Letter to God', icon: '✉️' },
        { id: 'dust_of_snow_10', name: 'Dust of Snow (Poem)', icon: '❄️' },
        { id: 'grammar_integrated_10', name: 'Integrated Grammar Practice', icon: '📝', prerequisites: ['letter_to_god_10'] },
    ]},
    { id: 'it_10', name: 'Information Technology', icon: '💻', topics: [
        { id: 'web_applications_10', name: 'Web Applications and Security', icon: '🔒' },
        { id: 'database_management_10', name: 'Database Management Systems', icon: '💾', prerequisites: ['web_applications_10'] },
    ]}
  ],
  '11': [
    { id: 'math_11', name: 'Mathematics', icon: '🧮', topics: [
      { id: 'sets_11', name: 'Sets', icon: 'U' },
      { id: 'relations_functions_11', name: 'Relations and Functions', icon: 'ƒ(x)', prerequisites: ['sets_11'] },
      { id: 'trigonometric_functions_11', name: 'Trigonometric Functions', icon: '🔺', prerequisites: ['relations_functions_11'] },
      { id: 'complex_numbers_11', name: 'Complex Numbers and Quadratic Equations', icon: '𝑖' },
      { id: 'linear_inequalities_11', name: 'Linear Inequalities', icon: '>', prerequisites: ['complex_numbers_11'] },
      { id: 'permutations_combinations_11', name: 'Permutations and Combinations', icon: '🔢' },
      { id: 'sequences_series_11', name: 'Sequences and Series', icon: '📊', prerequisites: ['linear_inequalities_11'] },
      { id: 'limits_derivatives_11', name: 'Limits and Derivatives', icon: '📈' },
    ]},
    { id: 'physics_11', name: 'Physics', icon: '⚛️', topics: [
      { id: 'units_measurement_11', name: 'Units and Measurement', icon: '📏' },
      { id: 'motion_straight_line_11', name: 'Motion in a Straight Line', icon: '🚗', prerequisites: ['units_measurement_11'] },
      { id: 'motion_plane_11', name: 'Motion in a Plane', icon: '✈️', prerequisites: ['motion_straight_line_11'] },
      { id: 'laws_motion_11', name: 'Laws of Motion', icon: '🍎', prerequisites: ['motion_plane_11'] },
      { id: 'work_energy_power_11', name: 'Work, Energy and Power', icon: '⚡', prerequisites: ['laws_motion_11'] },
      { id: 'gravitation_11', name: 'Gravitation', icon: '🌍' },
      { id: 'thermodynamics_11', name: 'Thermodynamics', icon: '🔥', prerequisites: ['work_energy_power_11'] },
    ]},
    { id: 'chemistry_11', name: 'Chemistry', icon: '🧪', topics: [
      { id: 'basic_concepts_chem_11', name: 'Some Basic Concepts of Chemistry', icon: '🧪' },
      { id: 'structure_atom_11', name: 'Structure of Atom', icon: '⚛️', prerequisites: ['basic_concepts_chem_11'] },
      { id: 'classification_elements_11', name: 'Classification of Elements and Periodicity in Properties', icon: '📊' },
      { id: 'chemical_bonding_11', name: 'Chemical Bonding and Molecular Structure', icon: '🔗', prerequisites: ['structure_atom_11'] },
      { id: 'states_of_matter_11', name: 'States of Matter', icon: '💨', prerequisites: ['chemical_bonding_11'] },
      { id: 'equilibrium_11', name: 'Equilibrium', icon: '⚖️' },
      { id: 'organic_chem_basics_11', name: 'Organic Chemistry – Some Basic Principles and Techniques', icon: '⌬', prerequisites: ['states_of_matter_11'] },
    ]},
    { id: 'biology_11', name: 'Biology', icon: '🧬', topics: [
      { id: 'living_world_11', name: 'The Living World', icon: '🌍' },
      { id: 'biological_classification_11', name: 'Biological Classification', icon: '🔬', prerequisites: ['living_world_11'] },
      { id: 'plant_kingdom_11', name: 'Plant Kingdom', icon: '🌿', prerequisites: ['biological_classification_11'] },
      { id: 'animal_kingdom_11', name: 'Animal Kingdom', icon: '🦓', prerequisites: ['plant_kingdom_11'] },
      { id: 'cell_cycle_11', name: 'Cell Cycle and Cell Division', icon: '➗' },
      { id: 'transport_plants_11', name: 'Transport in Plants', icon: '💧' },
      { id: 'human_physiology_11', name: 'Breathing and Exchange of Gases', icon: '👃', prerequisites: ['cell_cycle_11'] },
    ]},
    { id: 'english_core_11', name: 'English Core', icon: '📚', topics: [
        { id: 'portrait_lady_11', name: 'The Portrait of a Lady', icon: '👵' },
        { id: 'note_making_11', name: 'Note-Making and Summarisation', icon: '📝', prerequisites: ['portrait_lady_11'] },
    ]},
    { id: 'cs_11', name: 'Computer Science', icon: '💻', topics: [
        { id: 'computer_systems_11', name: 'Computer Systems and Organisation', icon: '🖥️' },
        { id: 'python_revision_11', name: 'Python Revision Tour', icon: '🐍', prerequisites: ['computer_systems_11'] },
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
      { id: 'differential_equations_12', name: 'Differential Equations', icon: 'ⅆy/ⅆx', prerequisites: ['integrals_12'] },
      { id: 'vectors_12', name: 'Vector Algebra', icon: '→' },
      { id: '3d_geometry_12', name: 'Three Dimensional Geometry', icon: '🧊', prerequisites: ['vectors_12'] },
      { id: 'probability_12', name: 'Probability', icon: '🎲' },
    ]},
    { id: 'physics_12', name: 'Physics', icon: '⚛️', topics: [
      { id: 'electric_charges_12', name: 'Electric Charges and Fields', icon: '⚡' },
      { id: 'electrostatic_potential_12', name: 'Electrostatic Potential and Capacitance', icon: '🔋', prerequisites: ['electric_charges_12'] },
      { id: 'current_electricity_12', name: 'Current Electricity', icon: '💡', prerequisites: ['electrostatic_potential_12'] },
      { id: 'magnetism_matter_12', name: 'Magnetism and Matter', icon: '🧲' },
      { id: 'electromagnetic_induction_12', name: 'Electromagnetic Induction', icon: '🔄', prerequisites: ['magnetism_matter_12'] },
      { id: 'alternating_current_12', name: 'Alternating Current', icon: '〰️', prerequisites: ['electromagnetic_induction_12'] },
      { id: 'ray_optics_12', name: 'Ray Optics and Optical Instruments', icon: '렌' },
      { id: 'wave_optics_12', name: 'Wave Optics', icon: '🌊', prerequisites: ['ray_optics_12'] },
      { id: 'semiconductor_electronics_12', name: 'Semiconductor Electronics', icon: '📲' },
    ]},
    { id: 'chemistry_12', name: 'Chemistry', icon: '🧪', topics: [
      { id: 'solutions_12', name: 'Solutions', icon: '⚗️' },
      { id: 'electrochemistry_12', name: 'Electrochemistry', icon: '🔋', prerequisites: ['solutions_12'] },
      { id: 'chemical_kinetics_12', name: 'Chemical Kinetics', icon: '⏱️', prerequisites: ['electrochemistry_12'] },
      { id: 'd_f_block_12', name: 'The d-and f-Block Elements', icon: '⛓️' },
      { id: 'coordination_compounds_12', name: 'Coordination Compounds', icon: '💠', prerequisites: ['d_f_block_12'] },
      { id: 'haloalkanes_haloarenes_12', name: 'Haloalkanes and Haloarenes', icon: '⌬' },
      { id: 'alcohols_phenols_ethers_12', name: 'Alcohols, Phenols and Ethers', icon: '⚗️', prerequisites: ['haloalkanes_haloarenes_12'] },
      { id: 'amines_12', name: 'Amines', icon: '🔬' },
      { id: 'biomolecules_12', name: 'Biomolecules', icon: '🧬', prerequisites: ['amines_12'] },
    ]},
    { id: 'biology_12', name: 'Biology', icon: '🧬', topics: [
      { id: 'reproduction_organisms_12', name: 'Reproduction in Organisms', icon: '🌱' },
      { id: 'human_reproduction_12', name: 'Human Reproduction', icon: '👶', prerequisites: ['reproduction_organisms_12'] },
      { id: 'reproductive_health_12', name: 'Reproductive Health', icon: '❤️', prerequisites: ['human_reproduction_12'] },
      { id: 'inheritance_variation_12', name: 'Principles of Inheritance and Variation', icon: '👨‍👩‍👧‍👦' },
      { id: 'molecular_basis_inheritance_12', name: 'Molecular Basis of Inheritance', icon: '🧬', prerequisites: ['inheritance_variation_12'] },
      { id: 'evolution_12', name: 'Evolution', icon: '🐒' },
      { id: 'biotechnology_12', name: 'Biotechnology: Principles and Processes', icon: '🔬' },
      { id: 'ecosystems_12', name: 'Ecosystems', icon: '🏞️' },
    ]},
     { id: 'english_core_12', name: 'English Core', icon: '📚', topics: [
        { id: 'last_lesson_12', name: 'The Last Lesson', icon: '🇫🇷' },
        { id: 'my_mother_at_66_12', name: 'My Mother at Sixty-Six (Poem)', icon: '👵' },
        { id: 'notice_writing_12', name: 'Notice Writing', icon: '📋', prerequisites: ['last_lesson_12'] },
    ]},
    { id: 'cs_12', name: 'Computer Science', icon: '💻', topics: [
        { id: 'python_revision_12', name: 'Python Revision Tour II', icon: '🐍' },
        { id: 'sql_12', name: 'Structured Query Language (SQL)', icon: '💾', prerequisites: ['python_revision_12'] },
        { id: 'computer_networks_12', name: 'Computer Networks', icon: '🌐' },
    ]}
  ],
};
