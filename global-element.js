var globalElement = (function () {
	return {
		container:{
			gclass: 'container px-4 py-5'
		},
		row:{
			gclass: 'row row-cols-1 row-cols-md-2 row-cols-lg-3 align-items-stretch g-4 py-5'
		},
		cardBase:{
			col:{
				gclass: 'col'
			},
			card:{
				gclass: 'card card-cover h-100 overflow-hidden rounded-4 shadow-lg',
			},
			contentHolder:{
				gclass: 'd-flex flex-column p-2 pb-3 text-white text-shadow-1 m-auto prvHi',
			}
		},
		treasureBase:{
			contentHolder:{				
				gstyle: 'background-image: url(\'images/background.png\'); background-repeat: no-repeat; background-position: 58% 30%; background-size: 95% 95%;'
			}
		},
		canvasBase:{
			gclass: 'img-fluid',
			gwidth: '480',
			gheight: '320'
		},
		h3:{
			gclass: 'pt-2 pb-2 mt-4 mb-4 display-6 lh-1 fw-bold text-center',
		},
		banner:{
			card:{
				gclass: ' text-bg-dark'	
			}
		},
		framesPerSecond:{
			card:{
				gstyle: 'background-color: #615079;'
			}
		},
		moveHorizontal:{
			card:{
				rclass: 'rounded-4'
			}
		},
		match:{
			card:{
				rclass: 'h-100'
			},
			contentHolder:{
				rclass: 'm-auto',
				gclass: ' mx-auto'
			}
		},
		clickAddRect:{
			card:{
				rclass: 'rounded-4'
			},
			canvas:{
				gclass: ' rounded-1',
				gstyle: 'border: 1px dashed black; cursor: pointer;'
			}
		},
		clickCount:{
			card:{
				gstyle: 'background-color: #336633; cursor: pointer;'
			}
		},
		moveShip:{
			card:{ 
				rclass: 'h-100' 
			},
			contentHolder:{
				rclass: 'm-auto',
				gclass: ' mx-auto',
				gstyle: ' cursor: pointer;'
			}
		},
		changeFont:{
			card:{
				gstyle: 'background-color: #CCCC99;'
			},
			contentHolder:{
				rclass: 'm-auto',
				gclass: ' mx-auto',
			},
			navHolder:{
				gclass: 'nav-scroller py-1 mt-4 mb-2'
			},
			nav:{
				gclass: 'nav d-flex justify-content-between'
			}
		},
		shootAlien:{
			card:{
				gstyle: 'background-color: black; cursor: pointer;'
			}
		},
		changeImg:{
			card:{
				rclass: 'h-100'
			},
			contentHolder:{
				rclass: 'flex-column m-auto',
				gclass: ' mx-auto'
			},
			btnHolder:{
				gclass: 'd-flex list-unstyled mt-auto'
			}
		},
		buildMap:{
			contentHolder:{
				gstyle: ' cursor: pointer'
			},
			btnHolder:{
				gclass: 'd-flex p-2 pb-3 list-unstyled mt-4 mx-auto'
			}
		}
	};
}());