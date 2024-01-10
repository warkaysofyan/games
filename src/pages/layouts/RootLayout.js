import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
export default function RootLayout() {
	return (
		<div className='main-container'>
			<div className='header'>
				<ul>
					<li>
						<NavLink to='/'>
							<p>tic-tac-teo</p>
						</NavLink>
					</li>
					<li>
						<NavLink to='/game2'>
							<p>game 2</p>
						</NavLink>
					</li>
				</ul>
			</div>
			<div className='content'>
				<Outlet />
			</div>
		</div>
	)
}
