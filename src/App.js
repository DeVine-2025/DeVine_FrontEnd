import { jsx as _jsx } from "react/jsx-runtime";
import queryClient from '@libs/query-client';
import { router } from '@routes/routers';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
function App() {
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsx(RouterProvider, { router: router }) }));
}
export default App;
