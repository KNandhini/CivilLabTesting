# TODO List

## Completed Tasks
- [x] Fix average calculation logic to select the most meaningful result for each test
- [x] Remove hard-coded test names and implement dynamic result selection based on field names and values
- [x] Add pagination to sample collection page to handle content that goes beyond page boundaries
- [x] Convert all rectangle borders and table borders from black to grey
- [x] Convert black backgrounds to grey backgrounds in tables
- [x] Reduce stroke width for thinner borders
- [x] Make 'Disclaimer:' label bold in test reports

## In Progress Tasks
- [ ] Test the cosmetic changes (grey borders, backgrounds, and disclaimer formatting)

## Pending Tasks
- [ ] Add pagination to other report pages if needed (TOCR, Observation Entry, Test Report)

## Notes
- Sample collection page now automatically adds new pages when content exceeds available space
- Pagination checks are added for: header table, material/product table, samples table, laboratory use table, and signature section
- Each section calculates its required height and checks if it fits on the current page before rendering
- All borders now use grey color (#808080) instead of black
- Table headers now have light grey backgrounds (#D3D3D3) instead of black backgrounds
- Checkboxes now use grey borders for a more professional appearance
- Stroke width reduced to 0.5 for thinner, more elegant borders
- Disclaimer label "Disclaimer:" is now bold while the rest of the disclaimer text remains italic

