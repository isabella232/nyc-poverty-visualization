
"use strict";

import React, { Component } from 'react';
import { Row, Col, Button, Glyphicon, Table } from 'react-bootstrap';
import HouseholdSlider from './components/HouseholdSlider.react.js';

import TotalIncome from './components/TotalIncome.react.js';
import BenefitsList from './components/BenefitsProgramsList.react.js'
import IncomeTable from './components/IncomeTable.react.js';
import BenefitsTable from './components/BenefitsTable.react.js';
import CostsTable from './components/CostsTable.react.js';

import BarChart from './components/BarChart.react.js';


//Benefits Logic Helpers
import CEOPovertyThreshold from './controllers/CEOPovertyThreshold.js';
import ACSChildCare from './controllers/ACSChildCare.js';
import SchoolFood from './controllers/SchoolFood.js';
import SNAP from './controllers/Snap.js';
import HEAP from './controllers/HEAP.js';
import WIC from './controllers/WIC.js';
import TaxRefund from './controllers/EarnedIncomeCredit.js';

import formatDollars from './controllers/formatDollars.js';

import Rcslider from 'rc-slider';



export default class StandAloneThreshold extends Component {
  constructor() {
    super();
    this.state = {
      family: { adults: 2, children: 2, income: 17500 },
      eligibility: {},
      totalBenefits: 0,
      combineIncomeBenefits: false
    };
    this._updateInput = this._updateInput.bind(this);
    this.combineIncomeBenefits = this.combineIncomeBenefits.bind(this);
    this.state.eligibility = this.determineEligibility(this.state.eligibility);
    this.state.CEOPovertyThreshold = CEOPovertyThreshold(this.state.family.income, this.state.family.adults, this.state.family.children);
    this.state.totalBenefits = this.state.eligibility.SNAP.snapAmount + this.state.eligibility.WIC.wicAmount + this.state.eligibility.TaxRefund.refundAmount + this.state.eligibility.SchoolFood.lunchValue;

  }

  determineEligibility(stateEligibility) {
    let
      income = this.state.family.income,
      adults = this.state.family.adults,
      children = this.state.family.children;

    stateEligibility.ACSChildCare = ACSChildCare(income, adults, children);
    stateEligibility.SchoolFood = SchoolFood(income, adults, children);
    stateEligibility.SNAP = SNAP(income, adults, children);
    stateEligibility.HEAP = HEAP(income, adults, children);
    stateEligibility.WIC = WIC(income, adults, children);
    stateEligibility.TaxRefund = TaxRefund(income, adults, children);

    return stateEligibility;
  }

  _updateInput(value, setting) {
    var family = this.state.family;
    family[setting] = value;
    this.setState({family: family });
    this.state.eligibility = this.determineEligibility(this.state.eligibility);
    this.state.CEOPovertyThreshold = CEOPovertyThreshold(this.state.family.income, this.state.family.adults, this.state.family.children);
    this.state.totalBenefits = this.state.eligibility.SNAP.snapAmount + this.state.eligibility.WIC.wicAmount + this.state.eligibility.TaxRefund.refundAmount + this.state.eligibility.SchoolFood.lunchValue;
  }

  combineIncomeBenefits(){
    if(this.state.combineIncomeBenefits === false){
      let combinedValue = this.state.family.income + this.state.totalBenefits;
      this.setState({
        combineIncomeBenefits: true,
        family: {
          income: combinedValue,
          adults: this.state.family.adults,
          children: this.state.family.children
        }
      })
    } else {
      this.setState({
        combineIncomeBenefits: true,
        family: {
          income: this.state.family.income,
          adults: this.state.family.adults,
          children: this.state.family.children
        }
      })
    }
  }

  render(){
    return(
      <div>
        <Col xs={12} sm={12} md={12}>
          <p>Adjust this household's income and composition using the sliders to see how their poverty threshold, benefits, and costs change.</p>
        </Col>
        <Col xs={12} sm={4} md={4}>
          <span>This household has <span className='figure'>{this.state.family.adults}</span> adults, <span className='figure'>{this.state.family.children}</span> children, and makes <span className='figure'>${formatDollars(this.state.family.income)}</span> a year.</span>
          <br/>
          <br/>
          <span>Income (${formatDollars(this.state.family.income)})</span>

          <HouseholdSlider target='income' min={10000} max={50000} default={this.state.family.income} onChange={this._updateInput} />
          <span>Adults ({this.state.family.adults})</span>
          <HouseholdSlider target='adults' min={0} max={6} default={this.state.family.adults} onChange={this._updateInput} />
          <span>Children ({this.state.family.children})</span>
          <HouseholdSlider target='children' min={0} max={6} default={this.state.family.children} onChange={this._updateInput} />
        </Col>
        <Col xs={12} sm={4} md={4}>
          <span>The benefits a family receives can put them above or below the poverty threshold.</span>
          <BenefitsTable
            taxCreditAmount={this.state.eligibility.TaxRefund.refundAmount}
            eligibility={this.state.eligibility}
          />
          <span>Total potential benefits: <span className="figure">${formatDollars(this.state.totalBenefits)}</span></span>
          <br/>
          <br/>
          <Button onClick={this.combineIncomeBenefits}>Add Benefits to Income</Button>
        </Col>
        <Col xs={12} sm={4} md={4}>
          <BarChart data={[[[this.state.family.income],[this.state.CEOPovertyThreshold]]]} />
        </Col>
      </div>
    );
  }
}