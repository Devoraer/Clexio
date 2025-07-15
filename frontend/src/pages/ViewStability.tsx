import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Save, Plus, Trash2, ChevronDown, Eye } from 'lucide-react';
import { useNavigate, useParams } from "react-router-dom";

const ViewStabilityForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL params
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    ID: '', stabilityName: '', projectName: '', dosageForm: '', dosageFormOther: '', batchNumber: '', strength: '', typeOfContainer: '', typeOfContainerOther: '', typeOfClosure: '',
    typeOfClosureOther: '', typeOfSeal: '', condition: '', desiccant: '', desiccantOther: '', cottonOrSimilarMaterial: '', cottonOrSimilarMaterialOther: '', stabilityStorageConditions: '',
    testIntervalsLongTerm: [], testIntervalsIntermediate: [], testIntervalsAccelerated: [], containerOrientation: '',
    containerOrientationOther: '', stabilitySpecificationNumber: '',
    tests: [{ testName: '', conditionsAndIntervals: '', amountSamplesTimePoints: '', totalAmountSamples: '' }],
    totalAmountSamples: '',
    completedBy: {name: '', date: '' },
    approvedByAnalytical: { name: '', date: '' },
    approvedByQA: { name: '', date: '' }
  });

  // Track original tests count to prevent editing existing tests
  const [originalTestsCount, setOriginalTestsCount] = useState(0);

  useEffect(() => {
    const fetchStabilityData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/api/stability-checklist/${id}`);
        
        console.log("🔎 Received ID:", id);

        if (response.ok) {
          const data = await response.json();
          console.log("📥 Fetched stability data:", data);
          
          // Transform API response back to form structure
          const transformedData = {
            ID: data.ID || '',
            stabilityName: data["Stability Name"] || '',
            projectName: data["Project name"] || '',
            dosageForm: data["Dosage Form"] || '',
            dosageFormOther: data["Dosage Form Other"] || '',
            batchNumber: data["Batch Number"] || '',
            strength: data["Strength"] || '',
            typeOfContainer: data["Type of Container"] || '',
            typeOfContainerOther: data["Type of Container Other"] || '',
            typeOfClosure: data["Type of Closure"] || '',
            typeOfClosureOther: data["Type of Closure Other"] || '',
            typeOfSeal: data["Type of Seal Condition"] || '',
            condition: data["Condition"] || '',
            desiccant: data["Desiccant"] || '',
            desiccantOther: data["Desiccant Other"] || '',
            cottonOrSimilarMaterial: data["Cotton or Similar Material"] || '',
            cottonOrSimilarMaterialOther: data["Cotton or Similar Material Other"] || '',
            stabilityStorageConditions: data["Stability Storage Conditions"] || '',
            testIntervalsLongTerm: data["Test Intervals Long Term"] ? data["Test Intervals Long Term"].split(", ") : [],
            testIntervalsIntermediate: data["Test Intervals Intermediate"] ? data["Test Intervals Intermediate"].split(", ") : [],
            testIntervalsAccelerated: data["Test Intervals Accelerated"] ? data["Test Intervals Accelerated"].split(", ") : [],
            containerOrientation: data["Container Orientation"] || '',
            containerOrientationOther: data["Container Orientation Other"] || '',
            stabilitySpecificationNumber: data["Stability Specification Number, if applicable"] || '',
            tests: data.tests || [],
            totalAmountSamples: data["Total amount of samples per study including spares"] || '',
            completedBy: {
              name: data["Name & Signature1"] || '',
              date: data["Date1"] || ''
            },
            approvedByAnalytical: {
              name: data["Name & Signature2"] || '',
              date: data["Date2"] || ''
            },
            approvedByQA: {
              name: data["Name & Signature3"] || '',
              date: data["Date3"] || ''
            }
          };
          
          setFormData({
            ...transformedData,
            condition: transformedData.condition || "",
            typeOfClosure: transformedData.typeOfClosure || "",
            typeOfSeal: transformedData.typeOfSeal || "",
            approvedByQA: transformedData.approvedByQA || { name: "", date: "" },
            // תמשיכי לשדות שחסרים לפי ההגדרה ב־useState
          });

          setOriginalTestsCount(transformedData.tests.length);
        } else {
          alert("❌ Error fetching stability data");
          navigate("/samples");
        }
      } catch (error) {
        console.error("❌ Error fetching stability data:", error);
        alert("❌ Error fetching data");
        navigate("/samples");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStabilityData();
    }
  }, [id, navigate]);

  // Dropdown options
  const [containerOptions, setContainerOptions] = useState(['HDP Bottle', 'LDPE Bag']);
  const [closureOptions, setClosureOptions] = useState(['Nitrogen', 'Head Seal']);
  
  // Dropdown states
  const [showContainerDropdown, setShowContainerDropdown] = useState(false);
  const [showClosureDropdown, setShowClosureDropdown] = useState(false);

  const testIntervalOptions = [
    'T-Zero', '1M', '2M', '3M', '4M', '5M', '6M', '9M', 
    '12M', '18M', '24M', '36M', '48M', '60M', 'Other'
  ];

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
        width: '70vw',
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
    inputReadOnly: {
      width: '100%',
      padding: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      backgroundColor: '#f9fafb',
      color: '#6b7280',
      cursor: 'not-allowed',
      boxSizing: 'border-box'
    },
    inputEditable: {
      width: '100%',
      padding: '12px',
      border: '2px solid #059669',
      borderRadius: '6px',
      fontSize: '14px',
      backgroundColor: '#f0fdf4',
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
      backgroundColor: '#f9fafb',
      color: '#6b7280',
      cursor: 'not-allowed',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxSizing: 'border-box'
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
      gap: '6px',
      color: '#6b7280'
    },
    radioItemDisabled: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      color: '#9ca3af',
      cursor: 'not-allowed'
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
      fontSize: '13px',
      color: '#9ca3af'
    },
    section: {
      backgroundColor: '#f9fafb',
      padding: '24px',
      borderRadius: '8px',
      marginBottom: '32px'
    },
    sectionEditable: {
      backgroundColor: '#f0fdf4',
      padding: '24px',
      borderRadius: '8px',
      marginBottom: '32px',
      border: '2px solid #059669'
    },
    testCard: {
      backgroundColor: '#ffffff',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      marginBottom: '16px'
    },
    testCardReadOnly: {
      backgroundColor: '#f9fafb',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      marginBottom: '16px'
    },
    testCardEditable: {
      backgroundColor: '#f0fdf4',
      padding: '20px',
      borderRadius: '8px',
      border: '2px solid #059669',
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
    testTitleReadOnly: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#6b7280'
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
    updateButton: {
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
      fontSize: '13px',
      backgroundColor: '#f9fafb',
      color: '#6b7280',
      cursor: 'not-allowed'
    },
    otherInputEditable: {
      marginTop: '8px',
      padding: '8px',
      border: '2px solid #059669',
      borderRadius: '4px',
      fontSize: '13px',
      backgroundColor: '#f0fdf4'
    },
    editableLabel: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#059669',
      marginBottom: '8px'
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '400px',
      fontSize: '18px',
      color: '#6b7280'
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTest = () => {
    setFormData(prev => {
      if (prev.tests.length >= 15) {
        alert("You can add up to 15 tests");
        return prev;
      }

      return {
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
      };
    });
  };

  const removeTest = (index: number) => {
    // Only allow removal of newly added tests (beyond original count)
    if (index >= originalTestsCount) {
      setFormData(prev => ({
        ...prev,
        tests: prev.tests.filter((_, i) => i !== index)
      }));
    }
  };

  const handleTestChange = (index: number, field: string, value: string) => {
    // Only allow editing of newly added tests (beyond original count)
    if (index >= originalTestsCount) {
      setFormData(prev => ({
        ...prev,
        tests: prev.tests.map((test, i) => 
          i === index ? { ...test, [field]: value } : test
        )
      }));
    }
  };

  const handleUpdate = async () => {
    try {
      const updateData = {
        ID: formData.ID,
        "Stability Specification Number, if applicable": formData.stabilitySpecificationNumber,
        "Total amount of samples per study including spares": formData.totalAmountSamples,
        "Name & Signature1": formData.completedBy.name,
        "Date1": formData.completedBy.date,
        "Name & Signature2": formData.approvedByAnalytical.name,
        "Date2": formData.approvedByAnalytical.date,
        "Name & Signature3": formData.approvedByQA.name,
        "Date3": formData.approvedByQA.date,
        // Only include new tests (beyond original count)
        newTests: formData.tests.slice(originalTestsCount).map((t) => ({
          testName: t.testName,
          conditionsAndIntervals: t.conditionsAndIntervals,
          amountSamplesTimePoints: t.amountSamplesTimePoints,
        }))
      };

      const response = await fetch(`http://localhost:3000/api/stability-checklist/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        alert("✅ Stability data updated successfully!");
        navigate("/samples");
      } else {
        const errorText = await response.text();
        alert("❌ Error: " + errorText);
      }
    } catch (error: any) {
      console.error("❌ Error updating stability data:", error);
      alert("❌ Error updating data: " + error.message);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div>Loading stability data...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            <Eye size={32} style={{ marginRight: '12px', verticalAlign: 'middle' }} />
            View Stability Checklist - ID: {formData.ID}
          </h1>
        </div>

        <div style={styles.formContent}>
          {/* Basic Information - READ ONLY */}
          <div style={styles.row}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Stability Name (Read Only)</label>
              <input
                type="text"
                value={formData.stabilityName}
                readOnly
                style={styles.inputReadOnly}
              />
            </div>
            
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Project Name (Read Only)</label>
              <input
                type="text"
                value={formData.projectName}
                readOnly
                style={styles.inputReadOnly}
              />
            </div>
          </div>

          {/* Dosage Form Section - READ ONLY */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Dosage Form (Read Only)</label>
            <div style={styles.radioGroup}>
              {['Intermediate', 'Final Product', 'Capsules', 'Tablets', 'Liquids', 'Other'].map((form) => (
                <label key={form} style={styles.radioItemDisabled}>
                  <input
                    type="radio"
                    name="dosageForm"
                    value={form}
                    checked={formData.dosageForm === form}
                    disabled
                  />
                  <span>{form}</span>
                </label>
              ))}
            </div>
            {formData.dosageForm === 'Other' && (
              <input
                type="text"
                value={formData.dosageFormOther}
                readOnly
                style={styles.otherInput}
              />
            )}
          </div>

          {/* Product Details - READ ONLY */}
          <div style={styles.rowThree}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Batch Number (Read Only)</label>
              <input
                type="text"
                value={formData.batchNumber}
                readOnly
                style={styles.inputReadOnly}
              />
            </div>
            
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Strength (Read Only)</label>
              <input
                type="text"
                value={formData.strength}
                readOnly
                style={styles.inputReadOnly}
              />
            </div>
            
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Type of Container (Read Only)</label>
              <div style={styles.dropdownContainer}>
                <div style={styles.dropdownButton}>
                  <span>{formData.typeOfContainer || 'Not specified'}</span>
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>
          </div>

          <div style={styles.rowThree}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Type of Closure (Read Only)</label>
              <div style={styles.dropdownContainer}>
                <div style={styles.dropdownButton}>
                  <span>{formData.typeOfClosure || 'Not specified'}</span>
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>
            
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Type of Seal Condition (Read Only)</label>
              <input
                type="text"
                value={formData.typeOfSeal}
                readOnly={formData.typeOfSeal !== ''}
                onChange={(e) => handleInputChange('typeOfSeal', e.target.value)}
                style={formData.typeOfSeal === '' ? styles.inputEditable : styles.inputReadOnly}
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.editableLabel}>Condition (Editable if empty)</label>
            <input
              type="text"
              value={formData.condition}
              readOnly={formData.condition !== ''}
              onChange={(e) => handleInputChange('condition', e.target.value)}
              style={formData.condition === '' ? styles.inputEditable : styles.inputReadOnly}
            />
          </div>

          {/* Yes/No/NA Sections - READ ONLY */}
          <div style={styles.row}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Desiccant (Read Only)</label>
              <div style={styles.radioGroup}>
                {['Yes', 'No', 'NA'].map((option) => (
                  <label key={option} style={styles.radioItemDisabled}>
                    <input
                      type="radio"
                      name="desiccant"
                      value={option}
                      checked={formData.desiccant === option}
                      disabled
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
              {formData.desiccant === 'Yes' && (
                <input
                  type="text"
                  value={formData.desiccantOther}
                  readOnly
                  style={styles.otherInput}
                />
              )}
            </div>
            
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Cotton or Similar Material (Read Only)</label>
              <div style={styles.radioGroup}>
                {['Yes', 'No', 'NA'].map((option) => (
                  <label key={option} style={styles.radioItemDisabled}>
                    <input
                      type="radio"
                      name="cottonOrSimilarMaterial"
                      value={option}
                      checked={formData.cottonOrSimilarMaterial === option}
                      disabled
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
              {formData.cottonOrSimilarMaterial === 'Yes' && (
                <input
                  type="text"
                  value={formData.cottonOrSimilarMaterialOther}
                  readOnly
                  style={styles.otherInput}
                />
              )}
            </div>
          </div>

          {/* Storage Conditions - READ ONLY */}
          <div style={styles.fieldGroup}>
            <h3 style={styles.sectionTitle}>Stability Storage Conditions (Read Only)</h3>
            <div style={styles.radioGroup}>
              {[
                'Long Term 25 ± 2°C  60%RH ±5%RH',
                'Accelerated 40 ± 2°C  75%RH ±5%RH',
                'Intermediate 30 ± 2°C  65%RH ±5%RH'
              ].map((orientation) => (
                <label key={orientation} style={styles.radioItemDisabled}>
                  <input
                    type="radio"
                    name="stabilityStorageConditions"
                    value={orientation}
                    checked={formData.stabilityStorageConditions === orientation}
                    disabled
                  />
                  <span>{orientation}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Test Intervals - READ ONLY */}
          {['LongTerm', 'Intermediate', 'Accelerated'].map((type) => (
            <div key={type} style={styles.section}>
              <h3 style={styles.sectionTitle}>
                Test Intervals: {type.replace(/([A-Z])/g, ' $1').trim()} (Read Only)
              </h3>
              <div style={styles.checkboxGroup}>
                {testIntervalOptions.map((interval) => (
                  <label key={interval} style={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      checked={formData[`testIntervals${type}`].includes(interval)}
                      disabled
                    />
                    <span>{interval}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {/* Container Orientation - READ ONLY */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Container Orientation (Read Only)</label>
            <div style={styles.radioGroup}>
              {['Upright', 'Horizontal', 'Inverted', 'NA', 'Other'].map((orientation) => (
                <label key={orientation} style={styles.radioItemDisabled}>
                  <input
                    type="radio"
                    name="containerOrientation"
                    value={orientation}
                    checked={formData.containerOrientation === orientation}
                    disabled
                  />
                  <span>{orientation}</span>
                </label>
              ))}
            </div>
            {formData.containerOrientation === 'Other' && (
              <input
                type="text"
                value={formData.containerOrientationOther}
                readOnly
                style={styles.otherInput}
              />
            )}
          </div>

          {/* Stability Specification Number - EDITABLE */}
          <div style={styles.fieldGroup}>
            <label style={styles.editableLabel}>Stability Specification Number (Editable)</label>
            <input
              type="text"
              value={formData.stabilitySpecificationNumber}
              onChange={(e) => handleInputChange('stabilitySpecificationNumber', e.target.value)}
              style={styles.inputEditable}
            />
          </div>

          {/* Tests Section */}
          <div style={styles.sectionEditable}>
            <div style={styles.testHeader}>
              <h3 style={styles.sectionTitle}>Required Tests per interval & amount of samples</h3>
              <button
                type="button"
                onClick={addTest}
                style={{...styles.button, ...styles.addButton}}
              >
                <Plus size={16} />
                <span>Add New Test</span>
              </button>
            </div>
            
            {formData.tests.map((test, index) => {
              const isReadOnly = index < originalTestsCount;
              return (
                <div key={index} style={isReadOnly ? styles.testCardReadOnly : styles.testCardEditable}>
                  <div style={styles.testHeader}>
                    <h4 style={isReadOnly ? styles.testTitleReadOnly : styles.testTitle}>
                      Test {index + 1} {isReadOnly ? '(Read Only)' : '(New - Editable)'}
                    </h4>
                    {!isReadOnly && (
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
                      <label style={isReadOnly ? styles.label : styles.editableLabel}>Test Name</label>
                      <input
                        type="text"
                        value={test.testName}
                        onChange={(e) => handleTestChange(index, 'testName', e.target.value)}
                        readOnly={isReadOnly}
                        style={isReadOnly ? styles.inputReadOnly : styles.inputEditable}
                      />
                    </div>
                    
                    <div style={styles.fieldGroup}>
                      <label style={isReadOnly ? styles.label : styles.editableLabel}>Conditions and Intervals</label>
                      <input
                        type="text"
                        value={test.conditionsAndIntervals}
                        onChange={(e) => handleTestChange(index, 'conditionsAndIntervals', e.target.value)}
                        readOnly={isReadOnly}
                        style={isReadOnly ? styles.inputReadOnly : styles.inputEditable}
                      />
                    </div>
                    
                    <div style={styles.fieldGroup}>
                      <label style={isReadOnly ? styles.label : styles.editableLabel}>Amount (samples x time points)</label>
                      <input
                        type="text"
                        value={test.amountSamplesTimePoints}
                        onChange={(e) => handleTestChange(index, 'amountSamplesTimePoints', e.target.value)}
                        readOnly={isReadOnly}
                        style={isReadOnly ? styles.inputReadOnly : styles.inputEditable}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total Amount of Samples - EDITABLE */}
          <div style={styles.fieldGroup}>
            <label style={styles.editableLabel}>Total amount of samples per study including spares (Editable)</label>
            <input
              type="text"
              value={formData.totalAmountSamples}
              onChange={(e) => handleInputChange('totalAmountSamples', e.target.value)}
              style={styles.inputEditable}
            />
          </div>

          {/* Approval Sections - READ ONLY */}
          {[
            { key: 'completedBy', title: 'Stability Checklist Completed by' },
            { key: 'approvedByAnalytical', title: 'Stability Checklist Approved by Analytical Project Manager' },
            { key: 'approvedByQA', title: 'Stability Checklist Approved by (QA)' }
          ].map(({ key, title }) => {
          const isReadOnly = !!formData[key].name || !!formData[key].date; // ✅ רק אם כבר מלאו

          return (
            <div key={key} style={styles.section}>
              <h3 style={styles.sectionTitle}>{title} {isReadOnly ? "(Read Only)" : "(Editable)"}</h3>

              <div style={styles.rowThree}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Name & Signature</label>
                  <input
                    type="text"
                    value={formData[key].name}
                    readOnly={isReadOnly}
                    style={isReadOnly ? styles.inputReadOnly : styles.inputEditable}
                    onChange={(e) => {
                      if (!isReadOnly) {
                        setFormData((prev) => ({
                          ...prev,
                          [key]: {
                            ...prev[key],
                            name: e.target.value
                          }
                        }));
                      }
                    }}
                  />
                </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Date</label>
          <input
            type="date"
            value={formData[key].date}
            readOnly={isReadOnly}
            style={isReadOnly ? styles.inputReadOnly : styles.inputEditable}
            onChange={(e) => {
              if (!isReadOnly) {
                setFormData((prev) => ({
                  ...prev,
                  [key]: {
                    ...prev[key],
                    date: e.target.value
                  }
                }));
              }
            }}
          />
        </div>
      </div>
    </div>
  );
  })} 

          <div style={styles.submitContainer}>
            <button
              type="button"
              onClick={handleUpdate}
              style={styles.updateButton}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Save size={18} />
                Update Stability Data
              </span>
            </button>
          </div>
        </div> 
      </div>   
    </div>     
  );
};

export default ViewStabilityForm;
