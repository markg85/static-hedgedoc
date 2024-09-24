### Markdown Progress Bar Extension

#### Overview
This extension adds support for progress bars in Markdown. The width of the progress bar is calculated with two decimal precision and truncated, not rounded. Templates can include decimal precision notation.

#### Syntax
The syntax for the progress bar is:
```
[progress current [start] [end] ["template"]]
```

#### Data Types
The input data type is defined as:
```
[progress Integer|Float [Integer|Float] [Integer|Float]["String"]]
```

#### Parameters
- `current`: Required integer or float representing the current value of the progress bar. This value must be between the start (0 as default) and end (100 as default) values.
- `start` (optional): Optional integer or float representing the starting value of the progress bar. Defaults to 0 if not provided.
- `end` (optional): Optional integer or float representing the ending value of the progress bar. Defaults to 100 if not provided.
- `template`: Optional string that defines the text to be displayed on the progress bar. Placeholders `{1}`, `{2}`, `{3}`, and `{%}` can be used to represent the current value, start value, end value, and the current percentage respectively. Placeholder precision can be specified using a colon followed by the number of decimal places up to 9 max.

### Progress Bar Examples

#### Using a Template for Current Value Precision
This example shows how to use a template to display the current value with two decimal places.
[progress 75 "Current: {1:.2}"]
```markdown
[progress 75 "Current: {1:.2}"]
```

#### Using Start and End Values
This example demonstrates how to use start and end values.
[progress 30 0 100]
```markdown
[progress 30 0 100]
```

#### High Precision in Progress Bar
This example shows how the progress bar handles high precision values.
[progress 32.54876 "Current: {1:.9}"]
```markdown
[progress 32.54876 "Current: {1:.9}"]
```

#### Using Percent Placeholder in Template
This example shows the usage of the `{%}` placeholder for current percentage.
[progress 2000 1000 5000 "Percent: {%}%, current: {1}"]
```markdown
[progress 2000 1000 5000 "Percent: {%}%, current: {1}"]
```

#### Non-Standard Start and End Values with Template
This example demonstrates how to use a template with non-standard start and end values.
[progress 60 10 110 "Current: {1:.4}"]
```markdown
[progress 60 10 110 "Current: {1:.4}"]
```

#### Simple Usage Without Template
This example shows how to use the progress bar without a template.
[progress 25]
```markdown
[progress 25]
```

#### Progress Bar with Non-Standard Start and End Values
This example demonstrates how to use the progress bar with non-standard start and end values.
[progress 20 20 80 "Progress is ongoing"]
```markdown
[progress 20 20 80 "Progress is ongoing"]
```

### Implementation Notes
- **Internal Precision Calculation**: The width of the progress bar is calculated using the following formula:
  ((current - start) / (end - start)) * 100
  This value is then truncated to two decimal places and used for the progress width of the bar itself.
- **Template Parsing**:
  - The template string can include placeholders `{1}`, `{2}`, and `{3}` which represent the current value, start value, and end value, respectively.
  - Placeholder precision can be specified using a colon followed by the number of decimal places. For example, `"{1:.2}"` will format the current value with two decimal places.
  - The `{%}` placeholder represents the current percentage value, it too can use decimal precision: `{%:.5}`.
- **Default Values**:
  - If no `start` or `end` values are provided, they default to 0 and 100 respectively.
- **Progress Value Implementation Note**: The `current` value must be between the `start` and `max`. Undefined behavior occurs if the `current` value is less than `start`.

### Block of examples
[progress 50]
[progress 75 "Current: {1:.2}"]
[progress 30 0 100]
[progress 60 10 110 "Progress from {2} to {3}: {1}"]
[progress 32.54876 "Current: {1:.9} Plain percentage {%}"]
[progress 80 20 100 "Progress is ongoing"]
[progress 80 20 100 "Progress percentage {%}"]
[progress 45 10 90 "Stage: {1:.1}"]
[progress 95.32 "Final: {1:.2}%"]
[progress 15 50 75 "Task completed: {1}"]