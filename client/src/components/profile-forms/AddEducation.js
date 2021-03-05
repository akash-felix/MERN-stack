import React, { Fragment,useState } from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {addEducation} from '../../actions/profile';
const AddEducation = ({addEducation,history}) => {
    const [formData,setFormData]=useState({
        school:'',
        degree:'',
        fieldofstudy:'',
        from:'',
        to:'',
        current:false,
        description:''
    });
    const [toDateDisabled,toggleDisabled]=useState(false);
    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }=formData;
    const onchange=e=>setFormData({...formData,[e.target.name]:e.target.value});
    return (
        <Fragment>
            <h1 class="large text-primary">
       Add Your Education
      </h1>
      <p class="lead">
        <i class="fas fa-code-branch"></i> Add any School
      </p>
      <small>* = required field</small>
      <form class="form" onSubmit={e=>{
          e.preventDefault();
          addEducation (formData,history);
      }}>
        <div class="form-group">
          <input type="text" placeholder="* School or bootcamp" name="school" required value={school} onChange={e=>onchange(e)}/>
        </div>
        <div class="form-group">
          <input type="text" placeholder="* degree or certificate" name="degree" required value={degree} onChange={onchange}/>
        </div>
        <div class="form-group">
          <input type="text" placeholder="field of study" name="fieldofstudy" value={fieldofstudy} onChange={onchange}/>
        </div>
        <div class="form-group">
          <h4>From Date</h4>
          <input type="date" name="from" value={from} onChange={onchange}/>
        </div>
         <div class="form-group">
          <p><input type="checkbox" name="current" checked={current} value={current} onChange={e=>{
              setFormData({...formData,current:!current});
              toggleDisabled(!toDateDisabled);
          }}/> {' '}Current Job</p>
        </div>
        <div class="form-group">
          <h4>To Date</h4>
          <input type="date" name="to" value={to} onChange={onchange} disabled={toDateDisabled ?'disabled':''}/>
        </div>
        <div class="form-group">
          <textarea
            name="description"
            cols="30"
            rows="5"
            placeholder="Program Description"
            value={description} onChange={onchange}
          ></textarea>
        </div>
        <input type="submit" class="btn btn-primary my-1" />
        <a class="btn btn-light my-1" href="dashboard.html">Go Back</a>
      </form>
        </Fragment>
    );
}


export default connect (null,{addEducation})(AddEducation);
