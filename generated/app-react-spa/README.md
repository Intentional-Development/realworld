# IDL Generated React SPA

This React single-page application was generated from IDL `ux_flow` and `ux_component` declarations.

## Generated Artifacts

- **Flows (10)**: ArticlePublishingFlow, Login, Register, CreateArticle, ViewArticle, EditArticle, Feed, YourFeed, ViewProfile, Settings
- **Components (8)**: ArticlePreview, ArticleMeta, CommentCard, CommentForm, Header, TagList, Pagination, FeedToggle
- **Services (1)**: ConduitRestApi

## Running the SPA

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. The SPA will be available at `http://localhost:4100`.

## Acceptance Test

Run the acceptance test (boots the SPA and checks basic health):

```bash
npm test
```

## Architecture

- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State**: React useState/useEffect (no external state library)
- **Auth**: JWT token stored in localStorage

## Known Limitations (MVP Scope)

- No styling beyond minimal layout
- No state management library
- No SSR / hydration
- Only `type: form` flow steps are implemented
- Token refresh flows not implemented
