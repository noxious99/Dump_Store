const colors = require('tailwindcss/colors');
/** @type {import('tailwindcss').Config} */

module.exports = {
    darkMode: ["class"],
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
  	extend: {
  		fontFamily: {
  			handwritten: [
  				'Caveat',
  				'cursive'
  			]
  		},
  		fontSize: {
  			header: '1 rem'
  		},
  		colors: {
                ...colors,
  			primary: {
  				DEFAULT: '#6366F1',
  				lite: '#c3c5ff',
  				foreground: '#F8FAFC'
  			},
  			foreground: '#F8FAFB',
  			secondary: {
  				DEFAULT: '#0EA5E9',
  				lite: '#b4e6ff',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			foregroundDark: '#0F172A',
  			heading: '#ffffff',
  			dark: '#0c0c0c',
  			grey: {
				DEFAULT: '#1D1D1D',
  				lite: '#F1FAFE',
				x100: '#F1F6FE', 
				x200: '#F1F1FE',
			},
  			error: {
				DEFAULT:'#db2525',
				x100: '#ffb5b5'
			},
  			warning: '#F59E0B',
  			success: {
				DEFAULT: '#84CC16',
  				x100: '#dcffa3',
			},
  			btn: {
  				red: {
  					DEFAULT: '#802828',
  					active: '#993333'
  				},
  				green: {
  					DEFAULT: '#052E16',
  					active: '#14532D'
  				}
  			},
  			background: '#FAFAFB',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
  corePlugins: {
    preflight: false,
  },
};
