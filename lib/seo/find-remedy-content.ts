export const FIND_REMEDY_EXAMPLE_QUERIES = [
  'itching night',
  'burning pains',
  'headache morning',
  'fear of death',
] as const;

export const FIND_REMEDY_HERO_DESCRIPTION =
  'Search plain symptom keywords to find homeopathic remedy matches from classical materia medica sources, including Boericke, Clarke, Kent, and Allen. Choose one source book, select exact symptom entries, and compare ranked remedy matches in the same workflow, with saved cases available for organized study, repertory research, and follow-up reference.';

export const FIND_REMEDY_FEATURE_INTRO = {
  heading: 'What the find remedy tool does',
  body:
    'HomeoRemedica turns plain symptom keywords into a focused remedy matching workflow. The home page starts with one search field, a source selector, saved cases access, and example queries that can seed the search. As you work, the finder keeps the active source, selected symptoms, and remedy results in the same screen. The tool is built for materia medica research and case organization, and the results remain reference information rather than diagnosis or treatment advice.',
} as const;

export const FIND_REMEDY_FEATURE_SECTIONS = [
  {
    heading: 'Symptom keyword search',
    body:
      'Start with ordinary symptom language in the search field, such as itching night, burning pains, headache morning, or fear of death. When the query has enough text to search, the finder requests matching symptom entries from the active source and shows them as matching indications. Selecting a result adds that exact symptom wording to the current workspace, and selecting an already chosen symptom removes it, so the list can stay limited to the wording you intend to compare.',
  },
  {
    heading: 'Source-specific matching',
    body:
      'The source button controls which book is used for both symptom suggestions and remedy matching. The available choices are A DICTIONARY OF PRACTICAL MATERIA MEDICA by John Henry CLARKE, M.D.; HOMEOPATHIC MATERIA MEDICA by William BOERICKE, M.D.; LECTURES ON HOMEOPATHIC MATERIA MEDICAL by JAMES TYLER KENT, A.M., M.D.; and The Materia Medica of the Nosodes. by Henry Clay ALLEN, M. D. Keeping one source active gives the search a single context: symptom results come from that source, selected symptoms are attached to that source, and remedy matching is requested against that same source. Changing source clears current selections and results after confirmation when work is active.',
  },
  {
    heading: 'Selected symptom workspace',
    body:
      'Chosen symptoms move into a workspace that appears above remedy results. The panel shows the number of selected entries and the active source name, then lists each symptom as its own removable row. You can remove one symptom, clear all selected symptoms, keep searching for more entries, or save the current set when signed in. Adding, removing, or clearing symptoms also clears old remedy results, so the next match calculation reflects only the symptom set currently visible.',
  },
  {
    heading: 'Ranked remedy matches',
    body:
      'The Find remedies button runs only after at least one symptom is selected. The web client sends the selected symptom names and active source to the remedy search API, then displays matching remedies in a results panel. Each result includes the remedy name, a source badge, a score based on matched symptom count, and a short preview of matched symptoms, with longer match lists shortened after the first few entries. The panel also keeps the reference-only treatment notice visible with the results.',
  },
  {
    heading: 'Saved cases',
    body:
      'Saved cases keep a named snapshot of the active source and selected symptoms. Signed-in users can open the save dialog from the selected symptom workspace, enter a case name, and then review saved cases from the toolbar. The saved cases dialog lists each case with its name, date, source, and symptom count. Loading a saved case replaces the current search after confirmation when active work exists, restores the saved source, and rebuilds the selected symptom list from that case.',
  },
] as const;

export const FIND_REMEDY_SOURCE_OVERVIEW = {
  heading: 'Example searches and source overview',
  body:
    'The example searches shown on the home page are itching night, burning pains, headache morning, and fear of death. Each example fills the search field so you can start from the same workflow used for typed queries. The source selector offers clarke materia medica, boericke materia medica, kent lectures, and allen nosodes. The source cards also show the full title and author for each book.',
} as const;

export const FIND_REMEDY_FAQ_ITEMS = [
  {
    question: 'How does the find remedy tool rank matches?',
    answer:
      'The finder compares selected symptoms with entries from the active source book and ranks remedies by overlap. A higher score means more selected symptoms matched that remedy in the chosen source.',
  },
  {
    question: 'Can I search within one source book?',
    answer:
      'Yes. Use the source selector to choose Boericke, Clarke, Kent, or Allen before adding symptoms. The selected source controls both symptom search and remedy matching.',
  },
  {
    question: 'How is the symptom set used?',
    answer:
      'Selected symptoms stay visible in the workspace until you remove them or clear the search. The final remedy ranking uses only the symptoms currently selected.',
  },
  {
    question: 'Can I save a remedy search for later?',
    answer:
      'Yes. After signing in, save the selected symptoms and source as a case. You can reopen saved cases later to continue research from the same symptom set.',
  },
] as const;
