
import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Spin, Select, Form } from "antd";
import APIClient2 from "../../Helpers/APICLIENT2";
import './Autocomplete.scss';
import Apiclient1 from "../../Helpers/Apiclient1";

const API_URL = "Airport/Search?keyword=";


// Module-level cache
const airportCache = {};

const AirportAutoComplete = (props) => {
  const [FlightRecentSearches, setFlightRecentSearches] = useState([]);
  const [options, setOptions] = useState({
    data: [],
    fetching: false,
  });
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchValue, setSearchValue] = useState(""); // Track typed text for auto-select on blur

  const abortControllerRef = useRef(null);

  const { Option, OptGroup } = Select;

  // Debounce utility function
  const debounce = (func, wait) => {
    let timeout;
    return function (...args) {
      const context = this;
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        timeout = null;
        func.apply(context, args);
      }, wait);
    };
  };

  // Fetch data function
  const fetchData = (value) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    if (value.trim() === "") {
      setOptions({ data: [], fetching: false });
      return;
    }

    // Check cache first
    if (airportCache[value]) {
      setOptions({ data: airportCache[value], fetching: false });
      return;
    }

    setOptions((prev) => ({ ...prev, fetching: true }));

    Apiclient1.get(`${API_URL}${value}`)
      .then((res) => {
        if (res?.statusCode === 200 && res?.data) {
          // Normalize the data to handle both old and new API response formats
          const normalizedData = res.data.map(item => ({
            // Use lowercase properties from new API, fallback to uppercase from old API
            city: item.city || item.City,
            airportCode: item.airportCode || item.AirportCode,
            airportDesc: item.airportDesc || item.AirportDesc,
            countryCode: item.countryCode || item.CountryCode,
            country: item.country || item.Country,
            type: item.type || item.Type,
            showCity: item.showCity || item.ShowCity,
            displayName: item.displayName || item.DisplayName,
            // Keep original for backward compatibility
            ...item
          }));
          airportCache[value] = normalizedData;
          
          // Also cache individually by airportCode so that direct code lookups (like Swap or Page Reload) hit the cache instantly
          normalizedData.forEach(item => {
              if (item.airportCode) {
                  // Only overwrite if it doesn't exist to avoid replacing a broader search with a single item, 
                  // or actually, a direct code search should return this exact item.
                  airportCache[item.airportCode] = [item];
              }
          });
          
          setOptions({ data: normalizedData, fetching: false });
        }
      })
      .catch((error) => {
        if (error.name === 'AbortError') {
          console.log('Request aborted');
        } else {
          console.error("Error fetching data:", error);
          setOptions({ data: [], fetching: false });
        }
      });
  };

  const debounceOnChange = useMemo(
    () => debounce(fetchData, 300),
    []
  );

  const handleSearch = (value) => {
    setSearchValue(value);
    debounceOnChange(value);
  };

  const handleSelect = (selectedValue) => {
    setSearchValue(""); // Clear search value when explicitly selected
    const existing = options.data.find((item) => (item.airportCode || item.AirportCode) === selectedValue);
    if (existing) {
      setSelectedRecord(existing); // Eagerly update selected record
      
      const updatedSearches = [
        existing,
        ...FlightRecentSearches.filter((item) => (item.airportCode || item.AirportCode) !== selectedValue),
      ];
      if (updatedSearches.length > 5) updatedSearches.pop();
      setFlightRecentSearches(updatedSearches);
    }
    
    // Call the onChange handler from selectProps to ensure form updates
    if (props.selectProps?.onChange) {
      props.selectProps.onChange(selectedValue);
    }
  };

  const handleBlur = () => {
    // If the user typed something but didn't select an option, auto-select the best match
    if (searchValue && options.data && options.data.length > 0) {
      const firstMatch = options.data[0];
      const code = firstMatch.airportCode || firstMatch.AirportCode;
      handleSelect(code);
    }
    setSearchValue(""); // Always clear search value on blur
  };

  useEffect(() => {
    const value = props?.selectProps?.value || "";
    if (value.trim() !== "") {
      // Use the cache if available, otherwise fetch
      if (airportCache[value]) {
        setOptions({ data: airportCache[value], fetching: false });
      } else {
        setOptions(prev => ({ ...prev, data: [], fetching: true }));
        fetchData(value);
      }
    }
  }, [props.selectProps?.value]);

  // Update selectedRecord when options change and value matches
  useEffect(() => {
    const value = props?.selectProps?.value;
    if (value && options.data.length > 0) {
      const record = options.data.find(d => (d.airportCode || d.AirportCode) === value);
      if (record) {
        setSelectedRecord(record);
      }
    } else if (value && selectedRecord && (selectedRecord.airportCode || selectedRecord.AirportCode) !== value) {
        // Value changed but we don't have the new record -> Clear old record to avoid stale display
        // This happens during Swap if the new value isn't in options.
        setSelectedRecord(null);
    }
  }, [options.data, props.selectProps?.value]);

  // Cleanup effect for abort controller
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Helper to get display options
  const displayOptions = useMemo(() => {
    // Mark regular search results
    let list = options.data.map(item => ({ ...item, isSearchResult: true }));
    
    // Check if selectedRecord is already in the list
    if (selectedRecord && !list.find(d => (d.airportCode || d.AirportCode) === (selectedRecord.airportCode || selectedRecord.AirportCode))) {
        // Append selectedRecord as HIDDEN option (for label resolution only)
        list.push({ ...selectedRecord, isSearchResult: false });
    }
    
    // Fallback: If value is provided but not in list and selectedRecord is not yet available 
    // (e.g. on initial load before fetch completes), inject a dummy option so the field isn't empty
    const currentValue = props?.selectProps?.value;
    if (currentValue && !selectedRecord && !list.find(d => (d.airportCode || d.AirportCode) === currentValue)) {
        list.push({ 
           airportCode: currentValue, 
           city: currentValue, 
           isSearchResult: false 
        });
    }

    // Ensure unique by airportCode (handle both lowercase and uppercase)
    return list.filter((v,i,a)=>a.findIndex(v2=>((v2.airportCode || v2.AirportCode)===(v.airportCode || v.AirportCode)))===i);
  }, [options.data, selectedRecord, props?.selectProps?.value]);

  return (
    <Form.Item {...props.formItemProps} className="airport_auto_complete notranslate">
      <Select
        style={{ width: "100%" }}
        showSearch
        optionLabelProp="label"
        popupMatchSelectWidth={false}
        dropdownStyle={{ minWidth: 360, maxWidth: 500 }}
        ref={(el) => {
          if (props.refName) {
            if (props.isfieldKey && props.refName.current) {
              props.refName.current[props.fieldKey] = el;
            } else {
              props.refName.current = el;
            }
          }
        }}
        notFoundContent={options.fetching ? <Spin size="small" /> : null}
        filterOption={false}
        onSearch={handleSearch}
        {...props.selectProps}
        onSelect={handleSelect}
        onBlur={handleBlur}
        popupClassName="airpot_names_dropdown"
        classNames={{ popup: "airpot_names_dropdown" }}
        className="notranslate HCI-airport-select"
        listHeight={320}
        getPopupContainer={() => document.body}
      >

        {displayOptions.length > 0 && (
          <OptGroup>
            {displayOptions.map((d, index) => {
              const city = d.city || d.City;
              const airportCode = d.airportCode || d.AirportCode;
              const airportDesc = d.airportDesc || d.AirportDesc;
              const countryCode = d.countryCode || d.CountryCode;
              
              const airportLabel = (
                <div 
                  style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', width: '100%', overflow: 'hidden' }}
                  title={`${city} - ${airportDesc || ''} (${airportCode})`}
                >
                  <span style={{ fontSize: "15px", fontWeight: "800", color: "#0b214a", lineHeight: "20px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                    {city}
                  </span>
                  <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "500", lineHeight: "16px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                    {airportDesc ? `${airportDesc} (${airportCode})` : airportCode}
                  </span>
                </div>
              );

              return (
                <Option 
                    key={index} 
                    value={airportCode} 
                    label={airportLabel}
                >
                  <div style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "12px", padding: "6px 8px" }}>
                    {countryCode && (
                      <img
                        src={`https://flagsapi.com/${countryCode}/flat/64.png`}
                        width="28"
                        height="28"
                        alt={countryCode}
                        style={{ borderRadius: "4px", objectFit: "cover", flexShrink: 0 }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <div style={{ overflow: "hidden", flex: 1, minWidth: 0 }}>
                      <div style={{ margin: 0, fontWeight: "700", color: "#0b214a", fontSize: "14px", lineHeight: "18px", whiteSpace: "nowrap" }}>
                        {city}{countryCode ? `, ${countryCode}` : ''}
                      </div>
                      <div style={{ margin: 0, fontSize: "12px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: "16px" }}>
                        {airportDesc} <span style={{ fontWeight: "700", color: "#1e4a8b" }}>({airportCode})</span>
                      </div>
                    </div>
                  </div>
                </Option>
              );
            })}
          </OptGroup>
        )}
      </Select>
    </Form.Item>
  );
};

export default AirportAutoComplete;