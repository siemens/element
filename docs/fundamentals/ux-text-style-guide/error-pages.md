## Error pages template

Well written error pages transform a potentially frustrating user experience into a clear, helpful one using simple and empathetic words to explain the problem and guide users to the next step.

We follow these templates when creating our main error pages. Although some of the call-to-action examples are use case-dependent and not always technically feasible, aim for ensuring users can move forward from the error page.

| HTTP code | Heading               | Description                                                                                 | Actions                                       |
| --------- | --------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------- |
| 400       | Bad request           | Failed to process the request. Check your request and try again.                            | Go back<br/>Try again<br/>Open homepage       |
| 401       | Unauthorized          | Authorization is required to access this page. Check your credentials and try again.        | Log in<br/>Go back<br/>Try again              |
| 403       | Access forbidden      | Use case 1: You do not have access to this page. Contact your administrator for access.     | Open homepage<br/>Go back                     |
|           |                       | Use case 2: You do not have access to this page. Request access here or return to homepage. | Request access<br/>Go back<br/>Open homepage  |
| 404       | Not found             | We’re not able to find that page. It may have been deleted or moved.                        | Report issue<br/>Open homepage<br/>Search app |
| 500       | Internal server error | This page is not available right now. Try refreshing the page or try again later.           | Reload<br/>Go back<br/>Open homepage          |

## General rules

Use the official code and definition so users can search for code terms and information themselves.

<div class="dos-and-donts" markdown>
<div class="dos" markdown>
- 401 Unauthorized
</div>
<div class="donts" markdown>
- 401 Unlawful
</div>
</div>

Use language suitable for all target users, including non-native English speakers.

<div class="dos-and-donts" markdown>
<div class="dos" markdown>
- This page is not available right now. Try again later.
</div>
<div class="donts" markdown>
- An unforeseen server-side condition prevented the fruitful processing of your request. This indicates an issue within our infrastructure, not a client-side input error.
</div>
</div>

Avoid jokes, memes, emojis or casual wording in error pages for industrial applications.

<div class="dos-and-donts" markdown>
<div class="dos" markdown>
- 401 Unauthorized
</div>
<div class="donts" markdown>
- Hold on! VIP access only! 🎩✨
</div>
</div>

Use sentence casing within the description with minimal punctuation and formatting.

<div class="dos-and-donts" markdown>
<div class="dos" markdown>
- There is an error on this page. Try again later.
</div>
<div class="donts" markdown>
- There <ins>is</ins> an ERROR on this **page**! Try again later.
</div>
</div>

## Dos and Don’ts

- Do give users a way out so the error page is not a dead end with only “Try again.” or “Try again later.”
- Do adapt your recommended actions depending on your use case and what is technically possible
- Don’t say your team is working on a solution to the error unless this is true

## Related

- [Error messages](./error-messages.md)
