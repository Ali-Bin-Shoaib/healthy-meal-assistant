const app_id = '&app_id=6f910b47';
const app_key = '&app_key=bdc8725b2e30f6fbc5dfebe2cde4a04b';
const url = `https://api.edamam.com/api/recipes/v2?type=public${
	app_id + app_key
}&health=alcohol-free&health=pork-free&health=kosher`;
$(function () {
	$('form#calculate-calories').on('submit', (e) => {
		e.preventDefault();
		const calories = parseInt($('#calories').val());
		calculateDailyCalories();
		$('#caloriesRange').val(calories);
		$('#caloriesRange+b').html(calories);
		getMeals(getFiltersValues(calories), true);
	});
	$(document).on('change', '#mealType,#dishType,#dietType,#caloriesRange', function () {
		getMeals(getFiltersValues());
	});
	$('#caloriesRange').on('input', function (e) {
		$('#caloriesRange+b').text($(this).val());
	});
	$(document).on('mouseenter', 'img', function () {
		$(this).css({
			transition: '300ms',
			transform: 'scale(1.150)',
		});
	});
	$(document).on('mouseleave', 'img', function () {
		$(this).css({
			transform: 'scale(1)',
		});
	});
	//* calculate calories for a preston based on gender, weight,height, and age
	function calculateBMR(gender, weight, height, age) {
		let bmr = 0;
		if (gender == 'male') {
			bmr = 10 * weight + 6.25 * height - 5 * age + 5;
		} else {
			bmr = 10 * weight + 6.25 * height - 5 * age - 161;
		}
		if (bmr < 0) bmr = 0;
		return bmr;
	}
	//* calculate needed calories based on activity level.
	function calculateTDEE(bmr, activityLevel) {
		const activityLevels = {
			notActive: 1.2,
			lightlyActive: 1.375,
			active: 1.55,
			veryActive: 1.725,
			extraActive: 1.9,
		};

		const tdee = bmr * activityLevels[activityLevel];
		return tdee;
	}
	//* calculate calories based on person gaol lose/gain/maintain
	function calculateCalorieGoal(tdee, goal) {
		let calorieGoal = 0;
		if (goal === 'lose-weight') {
			calorieGoal = tdee - 700;
		} else if (goal === 'gain-weight') {
			calorieGoal = tdee + 700;
		} else calorieGoal = tdee;
		if (calorieGoal < 0) calorieGoal = 0;
		return calorieGoal;
	}
	//* calculate calories from user input
	function calculateDailyCalories() {
		const selectedGoal = $('input[name="goal"]:checked').val();
		const selectedGender = $('input[name="gender"]:checked').val();
		const height = $('#height').val();
		const weight = $('#weight').val();
		const age = $('#age').val();
		const activityLevel = $('#activity-level').val();
		const dailyCalories = $('#calories');
		const bmr = calculateBMR(selectedGender, weight, height, age);
		const tdee = calculateTDEE(bmr, activityLevel);
		const totalCalories = calculateCalorieGoal(tdee, selectedGoal).toFixed(0);
		dailyCalories.val(totalCalories);
		return totalCalories;
	}
	//* get mealType, dishType, dietType, and calories
	function getFiltersValues(calories) {
		const mealType = $('#mealType').val();
		const dishType = $('#dishType').val();
		const DietType = $('#dietType').val();
		const caloriesRange = calories ? calories : $('#caloriesRange').val();
		return { mealType, dishType, DietType, calories: caloriesRange };
	}
	function getMeals(params, isRandom = false) {
		const query = parseObjectToQueryString(params);
		console.log('🚀 url:', url + query);
		$('#loading').removeClass('visually-hidden');
		const requestUrl = isRandom ? url + query + '&random=true' : url + query;
		sendRequest(requestUrl);
	}
	function sendRequest(requestUrl) {
		$.getJSON(requestUrl, (data, status) => {
			if (status == 'success') {
				$('#loading').addClass('visually-hidden');
				console.log('data: ', data);
				if (data.hits.length > 0) {
					$('#meals-container').text('');
					$('.modal').remove();
					let counter = 0;
					data.hits.forEach((data) => {
						renderMealCard(data.recipe, counter);
						renderModel(data.recipe, counter++);
					});
				} else {
					console.log('success but no data');
					$('#meals-container').html(`<div id="notFound" class='alert alert-warning'>No Meals Found</div>`);
					setTimeout(() => {
						$('#meals-container #notFound').remove();
					}, 3000);
				}
			} else {
				$('#loading').addClass('visually-hidden');
				$('#meals-container').html(
					`<div id="notFound" class='alert alert-danger'>Network Error, could not get data from server.</div>`
				);
			}
			console.log('status', status);
		});
	}
	function renderMealCard(data, id) {
		const template = `					
		<div class="col-md-3 h-100" id="card-container">
			<div class="card d-flex flex-column overflow-hidden">
				<img src="${data.image}" class="card-img" alt="${data.label}" />
				<div class="card-body flex-grow-1 text-truncate">
					<b class="card-title  ">${data.label}</b>
					<div class="card-text my-2">
						<b class="meal-calories">Calories: ${data.calories.toFixed(0)} </b>
					</div>
					<button type="button" class="btn btn-primary" data-bs-backdrop="false"
						data-bs-toggle="modal" data-bs-target="#card${id}">
						Details
					</button>
				</div>

			</div>
		</div>
		`;
		$('#meals-container').append(template);
	}
	function renderModel(data, id) {
		const template = `		<div class="modal fade" id="card${id}" tabindex="-1" aria-labelledby="card${id}Label" aria-hidden="true">
			<div class="modal-dialog modal-dialog-scrollable modal-xl ">
				<div class="modal-content ">
					<div class="modal-header">
						<h1 class="modal-title fs-5 text-capitalize" id="card${id}Label">meal details</h1>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<div class="container-fluid">
							<div class="row">
								<div class="col-md-8">
									<h3 class="text-capitalize"> ${data.label}</h3>
									<ul class="list-unstyled">
									${data.ingredients
										.map((i) => {
											const template = `<li>
											<div class="d-flex gap-2 align-items-center border-bottom border-black p-3">
											<img src="${i.image}" alt="${i.image}" class="rounded-5" width="100" >
											<b class="text-capitalize">${i.food} </b>
											</div>
										</li>`;
											return template;
										})
										.join('')}
									</ul>
								</div>
								<div class="col-md-4 ms-auto">
									<h2 class="text-capitalize">calories: ${data.calories.toFixed(0)}</h2>
									<div>
										<h2 class="text-capitalize">total nutrition</h2>
										<ul class="list-unstyled">
											${data.digest
												.map((d) => {
													const template = `<li>
													<div class='d-flex gap-2 border-bottom border-black'>
														<b >${d.label}: ${d.total.toFixed(1)} ${d.unit}</b>
													</div>
												</li>`;
													return template;
												})
												.join('')}
										</ul>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
					</div>
				</div>
			</div>
		</div>`;
		$('footer').before(template);
	}
	function parseObjectToQueryString(object) {
		return '&' + new URLSearchParams(object).toString();
	}
});
