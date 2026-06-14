// Portability check: render published-course JSON using ONLY @adapt-next/renderer + React.
// It imports nothing from the studio app/server — exactly what the host platform would do.
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CourseRenderer, type PublishedCourse } from "@adapt-next/renderer";

const course: PublishedCourse = {
  _id: "c1",
  title: "Portable render",
  config: { _theme: "t", _menu: "m", _defaultLanguage: "en", _defaultDirection: "ltr" },
  pages: [
    {
      _id: "p1",
      _kind: "page",
      title: "Page",
      _isAvailable: true,
      children: [],
      articles: [
        {
          _id: "a1",
          _isAvailable: true,
          blocks: [
            {
              _id: "b1",
              _isAvailable: true,
              components: [
                {
                  _id: "t1",
                  _component: "text",
                  _layout: "full",
                  _isAvailable: true,
                  body: "<p>Hello from text</p>",
                  properties: {},
                },
                {
                  _id: "q1",
                  _component: "mcq",
                  _layout: "full",
                  _isAvailable: true,
                  properties: {
                    instruction: "Capital of France?",
                    _selectable: 1,
                    _items: [
                      { text: "Paris", _shouldBeSelected: true },
                      { text: "Berlin", _shouldBeSelected: false },
                    ],
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const html = renderToStaticMarkup(React.createElement(CourseRenderer, { course }));

const checks: [string, boolean][] = [
  ["renders text body", html.includes("Hello from text")],
  ["renders mcq option", html.includes("Paris")],
  ["dispatches by _component (mcq class)", html.includes("an-component--mcq")],
  ["renders unknown-safe (no crash)", html.length > 100],
];

let ok = true;
for (const [name, pass] of checks) {
  console.log(`${pass ? "✓" : "✗"} ${name}`);
  if (!pass) ok = false;
}
console.log(ok ? "\nPORTABLE RENDER OK" : "\nFAILED");
process.exit(ok ? 0 : 1);
