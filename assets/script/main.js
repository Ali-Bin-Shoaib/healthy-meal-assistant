const app_id = '&app_id=6f910b47';
const app_key = '&app_key=bdc8725b2e30f6fbc5dfebe2cde4a04b';
let query = '&q=';
const url = `https://api.edamam.com/api/recipes/v2?type=public${app_id + app_key}&health=alcohol-free`;
const test =
	'https://api.edamam.com/api/recipes/v2?type=public&app_id=6f910b47&app_key=bdc8725b2e30f6fbc5dfebe2cde4a04b&health=alcohol-free&field=label&field=image';
$(function () {
	$('form#calculate-calories').on('submit', (e) => {
		e.preventDefault();
		const calories = parseInt($('#calories').val());
		if (calories < 0 || isNaN(calories)) {
			calculateDailyCalories();
		} else {
			$('#caloriesRange').val(calories);
			$('#caloriesRange+b').html(calories);
		}

		getMeals(getFiltersValues(calories), true);
	});
	$(document).on('change', '#mealType,#dishType,#dietType,#caloriesRange', function () {
		getMeals(getFiltersValues());
	});
	$('#caloriesRange').on('input', function (e) {
		$('#caloriesRange+b').text($(this).val());
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
			calorieGoal = tdee - 400;
		} else if (goal === 'gain-weight') {
			calorieGoal = tdee + 400;
		} else calorieGoal = tdee;
		if (calorieGoal < 0) calorieGoal = 0;
		return calorieGoal;
	}
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
	function getFiltersValues(calories) {
		const mealType = $('#mealType').val();
		const dishType = $('#dishType').val();
		const DietType = $('#dietType').val();
		// const calories=$('#calories').val();
		const caloriesRange = calories ? calories : $('#caloriesRange').val();
		return { mealType, dishType, DietType, caloriesRange };
	}
	function getMeals(params, isRandom = false) {
		const query = parseObjectToQueryString(params);
		console.log('🚀 url:', url + query);
		// const requestUrl = url + query;
		$('#loading').removeClass('visually-hidden');
		const requestUrl = isRandom ? url + query + '&random=true' : url + query;
		$.getJSON(requestUrl, (data, status) => {
			if (status == 'success') {
				$('#loading').addClass('visually-hidden');
				console.log('data: ', data); // data received
				if (data.hits.length > 0) {
					console.log(data.hits.length);
					$('#meals-container').text('');
					data.hits.forEach((data) => {
						renderMealCard(data);
					});
				} else {
					console.log('success but no data');
					$('#meals-container').html(`<div id="notFound" class='alert alert-warning'>No Meals Found</div>`);
					setTimeout(() => {
						$('#meals-container #notFound').remove();
					}, 2000);
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
	function renderMealCard(data) {
		const template = `					
							<div class="col-md-3 h-100" id="card-container">
								<div class="card d-flex flex-column overflow-hidden">
									<img src="${data.recipe.image}" class="card-img" 
										alt="${data.recipe.label}" />
									<div class="card-body flex-grow-1 text-truncate">
										<b class="card-title  ">${data.recipe.label}</b>
										<div class="card-text my-2">
											<b class="meal-calories">Calories: ${data.recipe.calories.toFixed(0)} </b>
										</div>
								<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#detailsModal">
								details
								</button>

								<div class="modal fade" id="detailsModal" tabindex="-1" aria-labelledby="detailsModalLabel" aria-hidden="true">
									<div class="modal-dialog">
										<div class="modal-content">
										<div class="modal-header">
											<h1 class="modal-title fs-5" id="detailsModalLabel">Modal title</h1>
											<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
										</div>
										<div class="modal-body">
											test
										</div>
										<div class="modal-footer">
											<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
											<button type="button" class="btn btn-primary">Save changes</button>
										</div>
										</div>
									</div>
								</div>		
							</div>
								</div>
							</div>
		`;
		$('#meals-container').append(template);
	}
	function parseObjectToQueryString(object) {
		return '&' + new URLSearchParams(object).toString();
	}
	$(document).on('mouseenter', 'img', function () {
		$(this).css({
			transition: '300ms',
			transform: 'scale(1.1)',
		});
	});
	$(document).on('mouseleave', 'img', function () {
		$(this).css({
			transform: 'scale(1)',
		});
	});
});
