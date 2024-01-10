//import './App.css'

import {
	Route,
	RouterProvider,
	createBrowserRouter,
	createRoutesFromElements,
} from 'react-router-dom'
import RootLayout from './pages/layouts/RootLayout'
import Tic from './pages/games/Tic'

function App() {
	let router = createBrowserRouter(
		createRoutesFromElements(
			<Route path='/' element={<RootLayout />}>
				<Route index element={<Tic />} />
			</Route>
		)
	)
	return <RouterProvider router={router} />
}

export default App
