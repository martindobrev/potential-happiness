var financejs = (function() {
	
	var F = {};
	
	/************************* FIXED-RATE MORTGAGE BEGIN *******************/ 
	F.frm = {
		exception: {}
	};

	/**
     * Calculates the duration of the fixed-rate mortgage loan
     *
     * @param {Object} o parameters
     * 		
	F.frm.calculateDuration = function(o) {
		if ('object' !== typeof o) return 0;

		// check for invalid input 
		if (undefined === o.interestRatePerYear || undefined === o.initialAmortizationRatePerYear
			|| 'number' !== typeof o.interestRatePerYear || 'number' !== typeof o.initialAmortizationRatePerYear
			|| o.interestRatePerYear <= 0 || o.initialAmortizationRatePerYear <= 0
			|| o.interestRatePerYear >= 1 || o.initialAmortizationRatePerYear >= 1) {
			return 0;
		}
		
		if (undefined === o.amortizationsPerYear || 'number' !== typeof o.amortizationsPerYear
			|| 1 > o.amortizationsPerYear || 365 < o.amortizationsPerYear) {
			console.log('DEFAULT VALUE');
			o.amortizationsPerYear = 1;
		}
		
		var ln1 = 1 + o.interestRatePerYear / o.initialAmortizationRatePerYear;
		var ln2 = 1 + o.interestRatePerYear / 12;
		return Math.log(ln1) / Math.log(ln2);
	};
	*/
	
		
	F.frm.exception.IllegalArgumentException = function(obj) {
		this.func = obj.func;
		this.message = obj.message;
	};


	//F.frm.calculatePlanByInitialAmortization = function(interest, amortization, principal, periods) {
	F.frm.calculatePlanByInitialAmortization = function(obj) {
		var func = arguments.callee.caller;
		if (undefined === obj || 'object' !== typeof obj) {
			throw new F.frm.exception.IllegalArgumentException({
				func: func,
				message: 'Function called without parameters or with illegal parameter types - a single parameter of type object shall be supplied!'
			});
		}
		
		if (undefined === obj.principal) {
			throw new F.frm.exception.IllegalArgumentException({
				func: func,
				message: 'principal parameter is undefined!'
			});
		}

		if ('number' !== typeof obj.principal || 0 > obj.principal) {
			throw new F.frm.exception.IllegalArgumentException({
				func: func,
				message: 'principal parameter shall be a number > 0!'
			});
		}
		if (undefined === obj.interest) {
			throw new F.frm.exception.IllegalArgumentException({
				func: func,
				message: 'principal parameter is undefined!'
			});
		}

		if ('number' !== typeof obj.interest || 0 > obj.interest || 1 < obj.interest) {
			throw new F.frm.exception.IllegalArgumentException({
				func: func,
				message: 'interest parameter shall be a number > 0 && < 1!'
			});
		}

		if (undefined === obj.periods || 'number' !== typeof obj.periods || 0 > obj.periods || 365 < obj.periods) {
			obj.periods = 12; // DEFAULT AMORTIZATION IS MONTH-BASED 
		}
			
		if (undefined !== obj.duration && undefined === obj.amortization) {
			try {
				obj.annuity = F.frm.calculateAnnuity({
					interest: obj.interest, 
					principal: obj.principal, 
					duration: obj.duration, 
					periods: obj.periods
				});
			} catch (ex) {
				throw new F.frm.exception.IllegalArgumentException({
					func: func,
					message: 'You have to either specify a duration or the initial amortization percentage!'
				});
			}
		} else {
			var amortizationPerPeriod = obj.amortization / obj.periods;
			var interestPerPeriod = obj.interest / obj.periods;
			var initialInterestAmount = interestPerPeriod * obj.principal;
			var initialAmortizationAmount = amortizationPerPeriod * obj.principal;
			obj.annuity = initialAmortizationAmount + initialInterestAmount;
		}
	  	
		if (obj.annuity === undefined) {
			throw new F.frm.exception.IllegalArgumentException({
				func: func,
				message: 'You have to either specify a duration or the initial amortization percentage!'
			});
		}		
		
		var tempResidual = obj.principal;
		var interestPerPeriod = obj.interest / obj.periods;
		
		var plan = {
			residual: 0,
			annuity: obj.annuity,
			annuityPerYear: obj.annuity * obj.periods,
			periods: []
		};

		var periodIndex = 0;
		while (tempResidual > 0 && periodIndex < 100 * obj.periods) {
			var interestAmount = interestPerPeriod * tempResidual;
			var amortizationAmount = obj.annuity - interestAmount;
			tempResidual = tempResidual - amortizationAmount; 

			plan.periods.push({
				index: periodIndex,
				interestAmount: interestAmount,
				amortizationAmount: amortizationAmount,
				residual: tempResidual
			});

			periodIndex++;
		}

		return plan;
	};
	
	/**
 	 * Calculates the annuity per period
	 */
	//F.frm.calculateAnnuity = function(interest, principal, duration, periods) {
	F.frm.calculateAnnuity = function(obj) {
			
			var func = arguments.callee.caller;
		if (undefined === obj || 'object' !== typeof obj) {
			throw new F.frm.exception.IllegalArgumentException({
				func: func,
				message: 'Function called without parameters or with illegal parameter types - a single parameter of type object shall be supplied!'
			});
		}
		
		if (undefined === obj.principal) {
			throw new F.frm.exception.IllegalArgumentException({
				func: func,
				message: 'principal parameter is undefined!'
			});
		}

		if ('number' !== typeof obj.principal || 0 > obj.principal) {
			throw new F.frm.exception.IllegalArgumentException({
				func: func,
				message: 'principal parameter shall be a number > 0!'
			});
		}
		if (undefined === obj.interest) {
			throw new F.frm.exception.IllegalArgumentException({
				func: func,
				message: 'interest is undefined!'
			});
		}

		if ('number' !== typeof obj.interest || 0 > obj.interest || 1 < obj.interest) {
			throw new F.frm.exception.IllegalArgumentException({
				func: func,
				message: 'interest shall be a number > 0 && < 1!'
			});
		}

		if (undefined === obj.periods || 'number' !== typeof obj.periods || 0 > obj.periods || 365 < obj.periods) {
			obj.periods = 12; // DEFAULT AMORTIZATION IS MONTH-BASED 
		}
		
		if (undefined === obj.duration) {
			throw new F.frm.exception.IllegalArgumentException({
				func: func,
				message: 'duration is undefined!'
			});
		}
		
		if ('number' !== typeof obj.duration || 0 > obj.duration) {
			throw new F.frm.exception.IllegalArgumentException({
				func: func,
				message: 'duration cannot be less than 0!'
			});
		}
	
		var A1 = obj.principal;
		var A3 = obj.interest;
		var A4 = obj.periods;
		var A5 = obj.duration / obj.periods;
			
		return (A1*A3/(1-Math.pow(A4/(A4+A3),A4*A5)))/A4;
	};

	/**
	 * Calculates the nominal yearly interest from the effective interest
	 */
	F.frm.calculateNominalInterestRate = function(effectiveInterestPercentage, periods) {
		if (undefined === periods) periods = 12;  // MONTHLY RATES
		var onePlusEffective = 1 + effectiveInterestPercentage;
		var root = Math.pow(onePlusEffective, 1 / periods);
		var nominalInterestPercentage = periods * (root - 1);
		return nominalInterestPercentage;
	};
	
	/**
	 * Calculates the real yearly interest from the nominal interest
	 */
	F.frm.calculateRealInterestRate = function(nominalInterestPercentage, periods) {
		if (undefined === periods) periods = 12;
		return Math.pow((1 + (nominalInterestPercentage / periods)), periods) - 1;
	};

		
	return F;



	
	
}());


try {
	var plan = financejs.frm.calculatePlanByInitialAmortization({
		
	});
	for (var i = 0; i < plan.periods.length; i++) {
		var p = plan.periods[i];
		console.log(i + ' - interest: ' + p.interestAmount + ', amortization: ' + p.amortizationAmount + ', residual: ' + p.residual);
	}
	console.log(' ANNUITY m: ' + plan.annuity + ', y: ' + plan.annuityPerYear);
} catch (ex) {
	console.error('Exception when calling function: ' + ex.func);
	console.error('----> ' + ex.message);
}



/*

var monthlyAmortization = startAmortizationPercentage / 12;
        var monthlyInterest = realInterestPercentage / 12;
        var lg1 = (monthlyInterest + monthlyAmortization) / monthlyAmortization;
        var lg2 = 1 + monthlyInterest;
        var durationInMonths = Math.log(lg1)/Math.log(lg2);
        
        return Math.ceil(durationInMonths / 12);

*/
