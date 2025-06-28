import React, { useState } from 'react';
import { Calendar, FileText, Save, Plus, Trash2, ChevronDown } from 'lucide-react';

const AddStabilityForm = () => {
  const [formData, setFormData] = useState({
    stabilityName: '',
    projectName: '',
    dosageForm: '',
    dosageFormOther: '',
    batchNumber: '',
    strength: '',
    typeOfContainer: '',
    typeOfContainerOther: '',
    typeOfClosure: '',
    typeOfClosureOther: '',
    typeOfSeal: '',
    condition: '',
    desiccant: '',
    desiccantOther: '',
    cottonOrSimilarMaterial: '',
    cottonOrSimilarMaterialOther: '',
    stabilityStorageConditions: {
      longTerm: '25 ± 2°C 60%RH ±5%RH',
      accelerated: '40 ± 2°C 75%RH ±5%RH',
      intermediate: '30 ± 2°C 65%RH ±5%RH'
    },
    testIntervalsLongTerm: [],
    testIntervalsIntermediate: [],
    testIntervalsAccelerated: [],
    containerOrientation: '',
    containerOrientationOther: '',
    stabilitySpecificationNumber: '',
    tests: [{
      testName: '',
      conditionsAndIntervals: '',
      amountSamplesTimePoints: '',
      totalAmountSamples: ''
    }],
    totalAmountSamples: '',
    completedBy: {
      name: '',
      signature: '',
      date: ''
    },
    approvedByAnalytical: {
      name: '',
      signature: '',
      date: ''
    },
    approvedByQA: {
      name: '',
      signature: '',
      date: ''
    }
  });

  // Dropdown options
  const [containerOptions, setContainerOptions] = useState(['HDP Bottle', 'LDPE Bag']);
  const [closureOptions, setClosureOptions] = useState(['Nitrogen', 'Head Seal']);
  
  // Dropdown states
  const [showContainerDropdown, setShowContainerDropdown] = useState(false);
  const [showClosureDropdown, setShowClosureDropdown] = useState(false);
  const [showLongTermDropdown, setShowLongTermDropdown] = useState(false);
  const [showAcceleratedDropdown, setShowAcceleratedDropdown] = useState(false);
  const [showIntermediateDropdown, setShowIntermediateDropdown] = useState(false);

  const testIntervalOptions = [
    'T-Zero', '1M', '2M', '3M', '4M', '5M', '6M', '9M', 
    '12M', '18M', '24M', '36M', '48M', '60M', 'Other'
  ];

  const storageConditionOptions = {
    longTerm: ['25 ± 2°C 60%RH ±5%RH', '5 ± 3°C', '15 ± 2°C', '-20 ± 5°C'],
    accelerated: ['40 ± 2°C 75%RH ±5%RH', '50 ± 2°C 75%RH ±5%RH'],
    intermediate: ['30 ± 2°C 65%RH ±5%RH', '30 ± 2°C 75%RH ±5%RH']
  };

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
        width: '96.5vw',
        margin: 0,
        padding: '24px',
        backgroundColor: '#ffffff',
        fontFamily: 'Arial, sans-serif'
    },
    formWrapper: {
      border: '2px solid #d1d5db',
      borderRadius: '8px',
      overflow: 'hidden'
    },
    header: {
      backgroundColor: '#f9fafb',
      padding: '24px',
      borderBottom: '1px solid #d1d5db',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: 0
    },
    formContent: {
      padding: '32px'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '20px',
      borderBottom: '2px solid #e5e7eb',
      paddingBottom: '8px'
    },
    row: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px',
      marginBottom: '32px'
    },
    rowThree: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '24px',
      marginBottom: '32px'
    },
    fieldGroup: {
      display: 'flex',
      flexDirection: 'column',
      marginBottom: '24px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '8px'
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box'
    },
    dropdownContainer: {
      position: 'relative',
      width: '100%'
    },
    dropdownButton: {
      width: '100%',
      padding: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      backgroundColor: '#ffffff',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxSizing: 'border-box'
    },
    dropdownMenu: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: '#ffffff',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      maxHeight: '200px',
      overflowY: 'auto',
      zIndex: 1000,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    dropdownItem: {
      padding: '12px',
      cursor: 'pointer',
      borderBottom: '1px solid #f3f4f6'
    },
    dropdownItemHover: {
      backgroundColor: '#f9fafb'
    },
    radioGroup: {
      display: 'flex',
      gap: '16px',
      marginTop: '8px',
      flexWrap: 'wrap',
      marginBottom: '24px'
    },
    radioItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    checkboxGroup: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
      gap: '12px',
      marginTop: '12px'
    },
    checkboxItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '13px'
    },
    section: {
      backgroundColor: '#f9fafb',
      padding: '24px',
      borderRadius: '8px',
      marginBottom: '32px'
    },
    testCard: {
      backgroundColor: '#ffffff',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      marginBottom: '16px'
    },
    testHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    },
    testTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#374151'
    },
    button: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 16px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    },
    addButton: {
      backgroundColor: '#2563eb',
      color: '#ffffff'
    },
    removeButton: {
      backgroundColor: 'transparent',
      color: '#dc2626',
      border: '1px solid #dc2626'
    },
    submitButton: {
      backgroundColor: '#059669',
      color: '#ffffff',
      padding: '16px 32px',
      fontSize: '16px',
      fontWeight: '600',
      margin: '32px auto 0',
      display: 'flex'
    },
    submitContainer: {
      textAlign: 'center'
    },
    otherInput: {
      marginTop: '8px',
      padding: '8px',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      fontSize: '13px'
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (section: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleDropdownSelect = (field: string, value: string, options: string[], setOptions: React.Dispatch<React.SetStateAction<string[]>>) => {
    handleInputChange(field, value);
    
    // Add to options if it's a custom value and not already in the list
    if (!options.includes(value) && value.trim() !== '') {
      setOptions(prev => [...prev, value]);
    }
  };

  const handleTestIntervalChange = (type: string, interval: string) => {
    const field = `testIntervals${type}`;
    setFormData(prev => {
      const currentIntervals = prev[field];
      const updatedIntervals = currentIntervals.includes(interval)
        ? currentIntervals.filter(i => i !== interval)
        : [...currentIntervals, interval];
      
      return {
        ...prev,
        [field]: updatedIntervals
      };
    });
  };

  const addTest = () => {
    setFormData(prev => ({
      ...prev,
      tests: [
        ...prev.tests,
        {
          testName: '',
          conditionsAndIntervals: '',
          amountSamplesTimePoints: '',
          totalAmountSamples: ''
        }
      ]
    }));
  };

  const removeTest = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tests: prev.tests.filter((_, i) => i !== index)
    }));
  };

  const handleTestChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      tests: prev.tests.map((test, i) => 
        i === index ? { ...test, [field]: value } : test
      )
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/stability-checklist/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert("✅ Checklist saved successfully!");
      } else {
        const errorText = await response.text();
        alert("❌ Error: " + errorText);
      }
    } catch (error) {
      console.error("❌ Error submitting form:", error);
      alert("❌ Error submitting form: " + error.message);
    }
  };

  const DropdownField = ({ 
    label, 
    value, 
    options, 
    onSelect, 
    placeholder, 
    showDropdown, 
    setShowDropdown 
  }: {
    label: string;
    value: string;
    options: string[];
    onSelect: (value: string) => void;
    placeholder: string;
    showDropdown: boolean;
    setShowDropdown: (show: boolean) => void;
  }) => (
    <div style={styles.fieldGroup}>
      <label style={styles.label}>{label}</label>
      <div style={styles.dropdownContainer}>
        <div
          style={styles.dropdownButton}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <span>{value || placeholder}</span>
          <ChevronDown size={16} />
        </div>
        {showDropdown && (
          <div style={styles.dropdownMenu}>
            {options.map((option, index) => (
              <div
                key={index}
                style={styles.dropdownItem}
                onClick={() => {
                  onSelect(option);
                  setShowDropdown(false);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }}
              >
                {option}
              </div>
            ))}
            <div style={{...styles.dropdownItem, borderTop: '1px solid #e5e7eb'}}>
              <input
                type="text"
                placeholder="Enter custom value..."
                style={{...styles.input, margin: 0}}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const customValue = e.currentTarget.value;
                    if (customValue.trim()) {
                      onSelect(customValue);
                      setShowDropdown(false);
                    }
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Stability Checklist Form</h1>
        </div>

        <div style={styles.formContent}>
          {/* Basic Information */}
          <div style={styles.row}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Stability Name</label>
              <input
                type="text"
                value={formData.stabilityName}
                onChange={(e) => handleInputChange('stabilityName', e.target.value)}
                style={styles.input}
              />
            </div>
            
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Project Name</label>
              <input
                type="text"
                value={formData.projectName}
                onChange={(e) => handleInputChange('projectName', e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          {/* Dosage Form Section */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Dosage Form</label>
            <div style={styles.radioGroup}>
              {['Intermediate', 'Final Product', 'Capsules', 'Tablets', 'Liquids', 'Other'].map((form) => (
                <label key={form} style={styles.radioItem}>
                  <input
                    type="radio"
                    name="dosageForm"
                    value={form}
                    checked={formData.dosageForm === form}
                    onChange={(e) => handleInputChange('dosageForm', e.target.value)}
                  />
                  <span>{form}</span>
                </label>
              ))}
            </div>
            {formData.dosageForm === 'Other' && (
              <input
                type="text"
                placeholder="Please specify..."
                value={formData.dosageFormOther}
                onChange={(e) => handleInputChange('dosageFormOther', e.target.value)}
                style={styles.otherInput}
              />
            )}
          </div>

          {/* Product Details */}
          <div style={styles.rowThree}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Batch Number</label>
              <input
                type="text"
                value={formData.batchNumber}
                onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                style={styles.input}
              />
            </div>
            
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Strength</label>
              <input
                type="text"
                value={formData.strength}
                onChange={(e) => handleInputChange('strength', e.target.value)}
                style={styles.input}
              />
            </div>
            
            <DropdownField
              label="Type of Container"
              value={formData.typeOfContainer}
              options={containerOptions}
              onSelect={(value) => handleDropdownSelect('typeOfContainer', value, containerOptions, setContainerOptions)}
              placeholder="Select container type..."
              showDropdown={showContainerDropdown}
              setShowDropdown={setShowContainerDropdown}
            />
          </div>

          <div style={styles.rowThree}>
            <DropdownField
              label="Type of Closure"
              value={formData.typeOfClosure}
              options={closureOptions}
              onSelect={(value) => handleDropdownSelect('typeOfClosure', value, closureOptions, setClosureOptions)}
              placeholder="Select closure type..."
              showDropdown={showClosureDropdown}
              setShowDropdown={setShowClosureDropdown}
            />
            
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Type of Seal Condition</label>
              <input
                type="text"
                value={formData.typeOfSeal}
                onChange={(e) => handleInputChange('typeOfSeal', e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          {/* Yes/No/NA Sections */}
          <div style={styles.row}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Desiccant</label>
              <div style={styles.radioGroup}>
                {['Yes', 'No', 'NA'].map((option) => (
                  <label key={option} style={styles.radioItem}>
                    <input
                      type="radio"
                      name="desiccant"
                      value={option}
                      checked={formData.desiccant === option}
                      onChange={(e) => handleInputChange('desiccant', e.target.value)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
              {formData.desiccant === 'Yes' && (
                <input
                  type="text"
                  placeholder="Please specify desiccant type..."
                  value={formData.desiccantOther}
                  onChange={(e) => handleInputChange('desiccantOther', e.target.value)}
                  style={styles.otherInput}
                />
              )}
            </div>
            
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Cotton or Similar Material</label>
              <div style={styles.radioGroup}>
                {['Yes', 'No', 'NA'].map((option) => (
                  <label key={option} style={styles.radioItem}>
                    <input
                      type="radio"
                      name="cottonOrSimilarMaterial"
                      value={option}
                      checked={formData.cottonOrSimilarMaterial === option}
                      onChange={(e) => handleInputChange('cottonOrSimilarMaterial', e.target.value)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
              {formData.cottonOrSimilarMaterial === 'Yes' && (
                <input
                  type="text"
                  placeholder="Please specify material type..."
                  value={formData.cottonOrSimilarMaterialOther}
                  onChange={(e) => handleInputChange('cottonOrSimilarMaterialOther', e.target.value)}
                  style={styles.otherInput}
                />
              )}
            </div>
          </div>

          {/* Storage Conditions */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Stability Storage Conditions</h3>
            <div style={styles.rowThree}>
              <DropdownField
                label="Long Term"
                value={formData.stabilityStorageConditions.longTerm}
                options={storageConditionOptions.longTerm}
                onSelect={(value) => handleNestedInputChange('stabilityStorageConditions', 'longTerm', value)}
                placeholder="Select long term condition..."
                showDropdown={showLongTermDropdown}
                setShowDropdown={setShowLongTermDropdown}
              />
              
              <DropdownField
                label="Accelerated"
                value={formData.stabilityStorageConditions.accelerated}
                options={storageConditionOptions.accelerated}
                onSelect={(value) => handleNestedInputChange('stabilityStorageConditions', 'accelerated', value)}
                placeholder="Select accelerated condition..."
                showDropdown={showAcceleratedDropdown}
                setShowDropdown={setShowAcceleratedDropdown}
              />
              
              <DropdownField
                label="Intermediate"
                value={formData.stabilityStorageConditions.intermediate}
                options={storageConditionOptions.intermediate}
                onSelect={(value) => handleNestedInputChange('stabilityStorageConditions', 'intermediate', value)}
                placeholder="Select intermediate condition..."
                showDropdown={showIntermediateDropdown}
                setShowDropdown={setShowIntermediateDropdown}
              />
            </div>
          </div>


          {/* Container Orientation */}
            <div style={styles.fieldGroup}>
            <h3 style={styles.sectionTitle}>Stability Storage Conditions</h3>
            <div style={styles.radioGroup}>
              {['Long Term 25 ± 2°C  60%RH ±5%RH', 'Accelerated 40 ± 2°C  75%RH ±5%RH', 'Intermediate 30 ± 2°C  65%RH ±5%RH'].map((orientation) => (
                <label key={orientation} style={styles.radioItem}>
                  <input
                    type="radio"
                    name="containerOrientation"
                    value={orientation}
                    checked={formData.containerOrientation === orientation}
                    onChange={(e) => handleInputChange('containerOrientation', e.target.value)}
                  />
                  <span>{orientation}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Test Intervals */}
          {['LongTerm', 'Intermediate', 'Accelerated'].map((type) => (
            <div key={type} style={styles.section}>
              <h3 style={styles.sectionTitle}>
                Test Intervals: {type.replace(/([A-Z])/g, ' $1').trim()}
              </h3>
              <div style={styles.checkboxGroup}>
                {testIntervalOptions.map((interval) => (
                  <label key={interval} style={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      checked={formData[`testIntervals${type}`].includes(interval)}
                      onChange={() => handleTestIntervalChange(type, interval)}
                    />
                    <span>{interval}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {/* Container Orientation */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Container Orientation</label>
            <div style={styles.radioGroup}>
              {['Upright', 'Horizontal', 'Inverted', 'NA', 'Other'].map((orientation) => (
                <label key={orientation} style={styles.radioItem}>
                  <input
                    type="radio"
                    name="containerOrientation"
                    value={orientation}
                    checked={formData.containerOrientation === orientation}
                    onChange={(e) => handleInputChange('containerOrientation', e.target.value)}
                  />
                  <span>{orientation}</span>
                </label>
              ))}
            </div>
            {formData.containerOrientation === 'Other' && (
              <input
                type="text"
                placeholder="Please specify orientation..."
                value={formData.containerOrientationOther}
                onChange={(e) => handleInputChange('containerOrientationOther', e.target.value)}
                style={styles.otherInput}
              />
            )}
          </div>

          {/* Stability Specification Number */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Stability Specification Number (if applicable)</label>
            <input
              type="text"
              value={formData.stabilitySpecificationNumber}
              onChange={(e) => handleInputChange('stabilitySpecificationNumber', e.target.value)}
              style={styles.input}
            />
          </div>

          {/* Required Tests Section */}
          <div style={styles.section}>
            <div style={styles.testHeader}>
              <h3 style={styles.sectionTitle}>Required Tests per interval & amount of samples</h3>
              <button
                type="button"
                onClick={addTest}
                style={{...styles.button, ...styles.addButton}}
              >
                <Plus size={16} />
                <span>Add Test</span>
              </button>
            </div>
            
            {formData.tests.map((test, index) => (
              <div key={index} style={styles.testCard}>
                <div style={styles.testHeader}>
                  <h4 style={styles.testTitle}>Test {index + 1}</h4>
                  {formData.tests.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTest(index)}
                      style={{...styles.button, ...styles.removeButton}}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                
                <div style={{...styles.rowThree, marginBottom: 0}}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Test Name</label>
                    <input
                      type="text"
                      value={test.testName}
                      onChange={(e) => handleTestChange(index, 'testName', e.target.value)}
                      style={styles.input}
                    />
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Conditions and Intervals</label>
                    <input
                      type="text"
                      value={test.conditionsAndIntervals}
                      onChange={(e) => handleTestChange(index, 'conditionsAndIntervals', e.target.value)}
                      style={styles.input}
                    />
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Amount (samples x time points)</label>
                    <input
                      type="text"
                      value={test.amountSamplesTimePoints}
                      onChange={(e) => handleTestChange(index, 'amountSamplesTimePoints', e.target.value)}
                      style={styles.input}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total Amount of Samples */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Total amount of samples per study including spares</label>
            <input
              type="text"
              value={formData.totalAmountSamples}
              onChange={(e) => handleInputChange('totalAmountSamples', e.target.value)}
              style={styles.input}
            />
          </div>

          {/* Approval Sections */}
          {[
            { key: 'completedBy', title: 'Stability Checklist Completed by' },
            { key: 'approvedByAnalytical', title: 'Stability Checklist Approved by Analytical Project Manager' },
            { key: 'approvedByQA', title: 'Stability Checklist Approved by (QA)' }
          ].map(({ key, title }) => (
            <div key={key} style={styles.section}>
              <h3 style={styles.sectionTitle}>{title}</h3>
              <div style={styles.rowThree}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Name & Signature</label>
                  <input
                    type="text"
                    value={formData[key].name}
                    onChange={(e) => handleNestedInputChange(key, 'name', e.target.value)}
                    style={styles.input}
                  />
                </div>
                
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Date</label>
                  <input
                    type="date"
                    value={formData[key].date}
                    onChange={(e) => handleNestedInputChange(key, 'date', e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Submit Button */}
          <div style={styles.submitContainer}>
            <button
              type="button"
              onClick={handleSubmit}
              style={{...styles.button, ...styles.submitButton}}
            >
              <Save size={20} />
              <span>Submit Stability Checklist</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStabilityForm;