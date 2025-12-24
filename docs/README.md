<!-- markdownlint-disable MD041-->

[![AI Banner](images/ai-element-ix-blog.svg)](get-started/element-mcp.md)

<!-- markdownlint-enable MD041-->

Discover the new Siemens Design Language MCP Server — your gateway to machine-readable
Siemens Design Language assets and standards. Streamline your workflow and boost productivity.
Learn more in the technical documentation [Build with AI](get-started/element-mcp.md).

# Siemens Element Design System

Siemens Element is a design system of the smart infrastructure domain
that implements the Siemens Design Language in Angular. It includes UI
components, design tools and resources, human interface guidelines, and
a vibrant community of contributors.

![Moodboard components dark](images/mood-components-dark.png)

## Angular components

We provide a rich set of reusable [Angular components](components/index.md)
which implement the Element design system. The components are developed in the
[siemens/element](https://github.com/siemens/element) repository on GitHub.

## Playground

Open our [demo playground](https://element.siemens.io/element-examples/#/overview)
to see examples for all our components.

## Flexible dashboard demo

Open our [flexible dashboard demo](https://element.siemens.io/dashboards-demo/).

## Figma design assets

Our Figma library contains all designed components, styles, and blueprints
ready for app design.

- The Figma library is maintained within the Siemens AG Global account.
- Siemens employees can use the self-service to obtain a Figma license. For
  guest access please contact us.
- The Figma library contains Siemens specific brand elements and is only
  accessible to Siemens employees and business partners.
- We are looking into ways to provide a publicly available Figma library.

<script type="text/javascript">
(function () {
  const animationEnd = Date.now() + 30000;
  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  function frame() {
    const timeLeft = animationEnd - Date.now();
    const skew = Math.max(0.8, 1 - 0.001);

    confetti({
      particleCount: 5,
      startVelocity: 0,
      origin: {
        x: Math.random(),
        y: (Math.random() * skew) - 0.2
      },
      colors: ['#eeeeee'],
      shapes: ['circle'],
      gravity: randomInRange(0.4, 0.6),
      scalar: randomInRange(0.4, 1),
      drift: randomInRange(-0.4, 0.4)
    });

    if (timeLeft > 0) {
      requestAnimationFrame(frame);
    }
  }

  setTimeout(() => frame(), 1000);
})();
</script>
