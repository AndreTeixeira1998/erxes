---
id: sortablelist
title: Sortable list
---

import { SortableListComponent } from "./sortablelist.js"

<p>You can sort the list with drag and drop actions.</p>
<SortableListComponent />

## API

<SortableListComponent type="APIsortablelist" table={[
['field*', 'any[]', '', 'Define list properties'],
['child*', 'function', '', 'Show list item'],
['onChangeFields*', 'function', '', 'Change field position'],
['showDragHandler', 'boolean', 'true', 'Activates hand cursor'],
['isDragDisabled', 'boolean', '', 'Activates drag function'],
['droppableId', 'string', '', 'Define droppable Id']
]} />
