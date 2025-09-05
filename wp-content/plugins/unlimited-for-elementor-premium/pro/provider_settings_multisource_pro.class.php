<?php
/**
 * @package Unlimited Elements
 * @author unlimited-elements.com
 * @copyright (C) 2012 Unite CMS, All Rights Reserved.
 * @license GNU/GPLv3 http://www.gnu.org/licenses/gpl-3.0.html
 * */
defined('UNLIMITED_ELEMENTS_INC') or die('Restricted access');

class UniteCreatorSettingsMultisourcePro{

	private $settings;
	private $objAddon;
	private $arrPostFields;
	private $arrProductsFields;
	private $arrTermsFields;
	private $arrUsersFields;
	private $arrMenuFields;
	private $arrInstaFields;
	private $arrGalleryFields;
	private $paramsItems;
	private $arrPostImageFields;


	const TYPE_JSONCSV = "json_csv";
	const TYPE_REPEATER = "repeater";
	const TYPE_POSTS = "posts";
	const TYPE_PRODUCTS = "products";
	const TYPE_TERMS = "terms";
	const TYPE_USERS = "users";
	const TYPE_MENU = "menu";
	const TYPE_INSTAGRAM = "instagram";
	const TYPE_GALLERY = "gallery";
	const TYPE_API = "api";


	public function __construct(){

		//for autocomplete
		$this->objAddon	= new UniteCreatorAddon();
		$this->objAddon = null;

		//init posts fields

		$this->arrPostFields = array(
			"static_value"=>__("-- Static Value --","unlimited-elements-for-elementor"),
			"text_before"=>__("-- Text Before --","unlimited-elements-for-elementor"),
			"text_after"=>__("-- Text After --","unlimited-elements-for-elementor"),
			"separator"=>__("-- Separator --","unlimited-elements-for-elementor"),
			"title"=>__("Post Title","unlimited-elements-for-elementor"),
			"alias"=>__("Post Name","unlimited-elements-for-elementor"),
			"intro"=>__("Post Intro","unlimited-elements-for-elementor") ,
			"content"=>__("Post Content","unlimited-elements-for-elementor"),
			"image"=>__("Post Featured Image","unlimited-elements-for-elementor"),
			"date"=>__("Post Date","unlimited-elements-for-elementor"),
			"link"=>__("Post Url","unlimited-elements-for-elementor"),
			"meta_field"=>__("Post Meta Field","unlimited-elements-for-elementor"),
			"term_field"=>__("Post Term","unlimited-elements-for-elementor"),
			"truncate"=>__("-- Truncate Text --","unlimited-elements-for-elementor"),
		);

		$this->arrPostFields = array_flip($this->arrPostFields);

		//init posts image fields

		$this->arrPostImageFields = array(
			"static_value"=>__("-- Static Value --","unlimited-elements-for-elementor"),
			"image"=>__("Post Featured Image","unlimited-elements-for-elementor"),
			"meta_field"=>__("Post Meta Field","unlimited-elements-for-elementor")
		);

		$this->arrPostImageFields = array_flip($this->arrPostImageFields);


		//init produts fields

		$this->arrProductsFields = array(
			"static_value"=>__("-- Static Value --","unlimited-elements-for-elementor"),
			"text_before"=>__("-- Text Before --","unlimited-elements-for-elementor"),
			"text_after"=>__("-- Text After --","unlimited-elements-for-elementor"),
			"separator"=>__("-- Separator --","unlimited-elements-for-elementor"),
			"title"=>__("Product Title","unlimited-elements-for-elementor"),
			"alias"=>__("Product Name","unlimited-elements-for-elementor"),
			"intro"=>__("Product Intro","unlimited-elements-for-elementor") ,
			"woo_price"=>__("Product Price","unlimited-elements-for-elementor") ,
			"woo_price_notax"=>__("Product Price - No Tax","unlimited-elements-for-elementor") ,
			"woo_price_withtax"=>__("Product Price - With Tax","unlimited-elements-for-elementor") ,
			"woo_currency_symbol"=>__("Product Currency Symbol","unlimited-elements-for-elementor") ,
			"woo_quantity"=>__("Product Quantity","unlimited-elements-for-elementor") ,
			"woo_link_addcart_cart"=>__("Product Add To Cart Link","unlimited-elements-for-elementor") ,
			"woo_link_addcart_checkout"=>__("Product Checkout Link","unlimited-elements-for-elementor") ,
			"content"=>__("Product Content","unlimited-elements-for-elementor"),
			"image"=>__("Product Image","unlimited-elements-for-elementor"),
			"date"=>__("Product Date","unlimited-elements-for-elementor"),
			"link"=>__("Product Url","unlimited-elements-for-elementor"),
			"meta_field"=>__("Product Meta Field","unlimited-elements-for-elementor"),
			"term_field"=>__("Product Term","unlimited-elements-for-elementor"),
			"truncate"=>__("-- Truncate Text --","unlimited-elements-for-elementor")
		);

		$this->arrProductsFields = array_flip($this->arrProductsFields);


		/**
		 * init terms fields
		 */
		$this->arrTermsFields = array(
			"static_value"=>__("-- Static Value --","unlimited-elements-for-elementor"),
			"text_before"=>__("-- Text Before --","unlimited-elements-for-elementor"),
			"text_after"=>__("-- Text After --","unlimited-elements-for-elementor"),
			"name"=>__("Term Title","unlimited-elements-for-elementor"),
			"slug"=>__("Term Name","unlimited-elements-for-elementor"),
			"description"=>__("Term Description","unlimited-elements-for-elementor"),
			"link"=>__("Term Link","unlimited-elements-for-elementor"),
			"num_posts"=>__("Num Posts","unlimited-elements-for-elementor"),
			"meta_field"=>__("Term Meta Field","unlimited-elements-for-elementor"),
			"truncate"=>__("-- Truncate Text --","unlimited-elements-for-elementor")
		);

		$this->arrTermsFields = array_flip($this->arrTermsFields);


		/**
		 * init users fields
		 */
		$this->arrUsersFields = array(
			"static_value"=>__("-- Static Value --","unlimited-elements-for-elementor"),
			"text_before"=>__("-- Text Before --","unlimited-elements-for-elementor"),
			"text_after"=>__("-- Text After --","unlimited-elements-for-elementor"),
			"separator"=>__("-- Separator --","unlimited-elements-for-elementor"),
			"name"=>__("Name","unlimited-elements-for-elementor"),
			"username"=>__("Username","unlimited-elements-for-elementor"),
			"email"=>__("Email","unlimited-elements-for-elementor"),
			"url_posts"=>__("User Posts Url","unlimited-elements-for-elementor"),
			"role"=>__("Role","unlimited-elements-for-elementor"),
			"website"=>__("Website","unlimited-elements-for-elementor"),
			"user_avatar_image"=>__("User Avatar Image","unlimited-elements-for-elementor"),
			"user_num_posts"=>__("User Num Posts","unlimited-elements-for-elementor"),
			"meta_field"=>__("User Meta Field","unlimited-elements-for-elementor"),
			"truncate"=>__("-- Truncate Text --","unlimited-elements-for-elementor")
		);

		$this->arrUsersFields = array_flip($this->arrUsersFields);


		/**
		 * init menu fields
		 */
		$this->arrMenuFields = array(
			"static_value"=>__("-- Static Value --","unlimited-elements-for-elementor"),
			"text_before"=>__("-- Text Before --","unlimited-elements-for-elementor"),
			"text_after"=>__("-- Text After --","unlimited-elements-for-elementor"),
			"separator"=>__("-- Separator --","unlimited-elements-for-elementor"),
			"title"=>__("Title","unlimited-elements-for-elementor"),
			"url"=>__("Url","unlimited-elements-for-elementor"),
			"target"=>__("Target","unlimited-elements-for-elementor"),
			"title_attribute"=>__("Title Attribute","unlimited-elements-for-elementor"),
			"description"=>__("Description","unlimited-elements-for-elementor"),
			"classes"=>__("Classes","unlimited-elements-for-elementor"),
			"html_link"=>__("HTML Link","unlimited-elements-for-elementor"),
			"meta_field"=>__("Menu Meta Field","unlimited-elements-for-elementor"),
			"truncate"=>__("-- Truncate Text --","unlimited-elements-for-elementor")
		);

		$this->arrMenuFields = array_flip($this->arrMenuFields);

		/**
		 * init insta fields
		 */
		$this->arrInstaFields = array(
			"static_value"=>__("-- Static Value --","unlimited-elements-for-elementor"),
			"text_before"=>__("-- Text Before --","unlimited-elements-for-elementor"),
			"text_after"=>__("-- Text After --","unlimited-elements-for-elementor"),
			"separator"=>__("-- Separator --","unlimited-elements-for-elementor"),
			"caption_text"=>__("Caption","unlimited-elements-for-elementor"),
			"image"=>__("Image","unlimited-elements-for-elementor"),
			"thumb"=>__("Thumb","unlimited-elements-for-elementor"),
			"link"=>__("Link","unlimited-elements-for-elementor"),
			"type"=>__("Type (image,video)","unlimited-elements-for-elementor"),
			"url_video"=>__("Video Url","unlimited-elements-for-elementor"),
			"truncate"=>__("-- Truncate Text --","unlimited-elements-for-elementor")
		);

		$this->arrInstaFields = array_flip($this->arrInstaFields);


		/**
		 * init gallery fields
		 */
		$this->arrGalleryFields = array(
			"static_value"=>__("-- Static Value --","unlimited-elements-for-elementor"),
			"text_before"=>__("-- Text Before --","unlimited-elements-for-elementor"),
			"text_after"=>__("-- Text After --","unlimited-elements-for-elementor"),
			"separator"=>__("-- Separator --","unlimited-elements-for-elementor"),
			"image_imageid"=>__("Image Url","unlimited-elements-for-elementor"),
			"image_title"=>__("Image Title","unlimited-elements-for-elementor"),
			"image_alt"=>__("Image Alt","unlimited-elements-for-elementor"),
			"image_caption"=>__("Image Caption","unlimited-elements-for-elementor"),
			"image_description"=>__("Image Description","unlimited-elements-for-elementor"),
			"truncate"=>__("-- Truncate Text --","unlimited-elements-for-elementor")
		);

		$this->arrGalleryFields = array_flip($this->arrGalleryFields);

	}


	/**
	 * set the settings
	 */
	public function setSettings(UniteCreatorSettings $settings){

		$this->settings = $settings;
		$this->objAddon = GlobalsProviderUC::$activeAddonForSettings;

	}


	/**
	 * add items multisource
	 */
	public function addItemsMultisourceSettings($name, $value, $title, $param){

		UniteFunctionsUC::validateNotEmpty($this->settings, "settings object");

		$includedAttributes = UniteFunctionsUC::getVal($param, "multisource_included_attributes");
		$includedAttributes = trim($includedAttributes);

		$arrIncludedAttributes = explode(",", $includedAttributes);
		$arrIncludedAttributes = UniteFunctionsUC::arrayToAssoc($arrIncludedAttributes);

		//------ items source ------
		$arrSource = array();
		$arrSource["items"] = __("Items", "unlimited-elements-for-elementor");
		$arrSource["posts"] = __("Posts", "unlimited-elements-for-elementor");

		$isWooActive = UniteCreatorWooIntegrate::isWooActive();

		if($isWooActive == true)
			$arrSource["products"] = __("WooCommerce Products", "unlimited-elements-for-elementor");

		$metaRepeaterTitle = __("Meta Field", "unlimited-elements-for-elementor");

		$isAcfExists = UniteCreatorAcfIntegrate::isAcfActive();

		if($isAcfExists == true)
			$metaRepeaterTitle = __("ACF Cutom Field", "unlimited-elements-for-elementor");

		$arrSource[self::TYPE_REPEATER] = $metaRepeaterTitle;
		$arrSource[self::TYPE_JSONCSV] = __("JSON or CSV", "unlimited-elements-for-elementor");
		$arrSource[self::TYPE_GALLERY] = __("Gallery", "unlimited-elements-for-elementor");
		$arrSource[self::TYPE_TERMS] = __("Terms", "unlimited-elements-for-elementor");
		$arrSource[self::TYPE_USERS] = __("Users", "unlimited-elements-for-elementor");
		$arrSource[self::TYPE_MENU] = __("Menu", "unlimited-elements-for-elementor");

		$hasInstagram = HelperProviderCoreUC_EL::isInstagramSetUp();

		if($hasInstagram)
			$arrSource["instagram"] = __("Instagram", "unlimited-elements-for-elementor");
		
		//add api integrations
		
		if(GlobalsUnlimitedElements::$enableGoogleApi == true)
			$arrSource[self::TYPE_API] = __("API Integrations", "unlimited-elements-for-elementor");
		
		$arrSource = array_flip($arrSource);

		$params = array();
		$params["origtype"] = UniteCreatorDialogParam::PARAM_DROPDOWN;

		$this->settings->addSelect($name."_source", $arrSource, __("Items Source", "unlimited-elements-for-elementor"), "items", $params);

		if(empty($this->objAddon))
			return(false);

		$hasItems = $this->objAddon->isHasItems();

		if($hasItems == false)
			return(false);


		$paramsItems = $this->objAddon->getParamsItems();

		$paramsItems = $this->filterParamItemsByIncludedAttributes($paramsItems, $arrIncludedAttributes);

		if(empty($paramsItems))
			return(false);

		$this->paramsItems = $paramsItems;


		//posts

		$this->addMultisourceConnectors_object($name, $arrIncludedAttributes, self::TYPE_POSTS);

		//products

		if($isWooActive == true)
			$this->addMultisourceConnectors_object($name, $arrIncludedAttributes, self::TYPE_PRODUCTS);


		//repeater

		$this->addMultisourceConnectors_repeater($name, $arrIncludedAttributes);

		//json csv

		$this->addMultisourceConnectors_jsonCsv($name, $arrIncludedAttributes);

		//gallery

		$this->addMultisourceConnectors_gallery($name, $arrIncludedAttributes);

		//terms

		$this->addMultisourceConnectors_object($name, $arrIncludedAttributes, self::TYPE_TERMS);

		//users

		$this->addMultisourceConnectors_object($name, $arrIncludedAttributes, self::TYPE_USERS);

		//menu

		$this->addMultisourceConnectors_object($name, $arrIncludedAttributes, self::TYPE_MENU);

		//instagram

		$this->addMultisourceConnectors_instagram($name, $arrIncludedAttributes);

		//api
		
		if(GlobalsUnlimitedElements::$enableGoogleApi == true)
			$this->addMultisourceConnectors_api($name, $arrIncludedAttributes);
		

		//--------- h3 before meta ----------

		$params = array();
		$params["origtype"] = UniteCreatorDialogParam::PARAM_HR;

		$this->settings->addHr($name."_hr_before_debug",$params);

		//--------- debug - show csv example ----------

		$conditionCsv = array($name."_source"=>self::TYPE_JSONCSV);

		$params = array();
		$params["origtype"] = UniteCreatorDialogParam::PARAM_RADIOBOOLEAN;
		$params["description"] = __("Here you can show the example data and test it in the textarea", "unlimited-elements-for-elementor");
		$params["elementor_condition"] = $conditionCsv;

		$this->settings->addRadioBoolean($name."_show_example_jsoncsv", __("Show Example JSON and CSV Data", "unlimited-elements-for-elementor"), false, "Yes", "No", $params);


		//--------- debug input data ----------

		$params = array();
		$params["origtype"] = UniteCreatorDialogParam::PARAM_RADIOBOOLEAN;
		//$params["description"] = __("Show the current object (posts, terms etc) raw input data", "unlimited-elements-for-elementor");

		$this->settings->addRadioBoolean($name."_show_input_data", __("Debug - Show Input Data", "unlimited-elements-for-elementor"), false, "Yes", "No", $params);

		//--------- debug data type ----------

		$params = array();
		$params["origtype"] = UniteCreatorDialogParam::PARAM_DROPDOWN;
		$params["elementor_condition"] = array($name."_show_input_data"=>"true");


		$arrDebugType = array();
		$arrDebugType["input"] = __("Input Data", "unlimited-elements-for-elementor");
		$arrDebugType["output"] = __("Input Settings", "unlimited-elements-for-elementor");
		$arrDebugType["input_output"] = __("Data And Settings", "unlimited-elements-for-elementor");

		$arrDebugType = array_flip($arrDebugType);

		$this->settings->addSelect($name."_input_data_type", $arrDebugType, __("Show Data Type", "unlimited-elements-for-elementor"), "input", $params);


		//--------- debug meta - for objects----------

		$conditionMeta = array($name."_source"=>array(self::TYPE_POSTS, self::TYPE_TERMS, self::TYPE_USERS, self::TYPE_MENU, self::TYPE_REPEATER));


		$params = array();
		$params["origtype"] = UniteCreatorDialogParam::PARAM_RADIOBOOLEAN;
		//$params["description"] = __("Show the current object (posts, terms etc) meta fields, turn off it after choose the right one", "unlimited-elements-for-elementor");

		$params["elementor_condition"] = $conditionMeta;

		$this->settings->addRadioBoolean($name."_show_metafields", __("Debug - Show Meta Fields", "unlimited-elements-for-elementor"), false, "Yes", "No", $params);

	}


	/**
	 * filter params by included attributes array
	 */
	private function filterParamItemsByIncludedAttributes($params, $arrIncludedAttributes){

		if(empty($params))
			return($params);

		if(empty($arrIncludedAttributes))
			return($params);

		$arrParamsNew = array();

		foreach($params as $param){

			$name = UniteFunctionsUC::getVal($param, "name");

			if(isset($arrIncludedAttributes[$name]) == false)
				continue;

			$arrParamsNew[] = $param;
		}

		return($arrParamsNew);
	}


	/**
	 * add multisource connectors
	 */
	private function addMultisourceConnectors_object($name, $arrIncludedAttributes, $type ){

		$condition = array($name."_source"=>$type);

		//add the title

		$titleParam = array();
		$titleParam["type"] = UniteCreatorDialogParam::PARAM_TEXTFIELD;
		$titleParam["name"] = "title";
		$titleParam["title"] = "Title";

		$this->putParamConnector_object($name, $titleParam, $condition, $type);


		// --- items source select

		foreach($this->paramsItems as $itemParam){

			$paramName = UniteFunctionsUC::getVal($itemParam, "name");

			if($paramName == "title")
				continue;

			$this->putParamConnector_object($name, $itemParam, $condition, $type);
		}

	}

	/**
	 * add multisource connectors - repeater
	 */
	private function addMultisourceConnectors_instagram($name, $arrIncludedAttributes){

		$paramsItems = $this->objAddon->getParamsItems();

		$paramsItems = $this->filterParamItemsByIncludedAttributes($paramsItems, $arrIncludedAttributes);

		if(empty($paramsItems))
			return(false);

		$condition = array($name."_source"=>self::TYPE_INSTAGRAM);

		$titleParam = array();
		$titleParam["type"] = UniteCreatorDialogParam::PARAM_TEXTFIELD;
		$titleParam["name"] = "title";
		$titleParam["title"] = "Title";

		$this->putParamConnector_regular($name, $titleParam, $condition, self::TYPE_INSTAGRAM);


		// --- items source select

		foreach($this->paramsItems as $itemParam){

			$this->putParamConnector_regular($name, $itemParam, $condition, self::TYPE_INSTAGRAM);
		}

	}


	/**
	 * add multisource connectors - repeater
	 */
	private function addMultisourceConnectors_api($name, $arrIncludedAttributes){

		$paramsItems = $this->objAddon->getParamsItems();
		$paramsItems = $this->filterParamItemsByIncludedAttributes($paramsItems, $arrIncludedAttributes);

		if(empty($paramsItems))
			return;

		$apiTypes = UniteCreatorAPIIntegrations::getInstance()->getTypes();

		$condition = array($name . "_source" => self::TYPE_API);

		// add empty text if no apis found
		if(empty($apiTypes)){
			$params = array();
			$params["origtype"] = UniteCreatorDialogParam::PARAM_STATIC_TEXT;
			$params["elementor_condition"] = $condition;

			$text = __("No API types available", "unlimited-elements-for-elementor");
			$paramName = $name . "_api_empty_text";

			$this->settings->addStaticText($text, $paramName, $params);

			return;
		}

		// api types select
		
		$params = array();
		$params["origtype"] = UniteCreatorDialogParam::PARAM_DROPDOWN;
		$params["elementor_condition"] = $condition;

		$text = __("API Type", "unlimited-elements-for-elementor");
		$apiTypeParamName = $name . "_api_type";

		$apiTypes = array_flip($apiTypes);
		$apiTypes = UniteFunctionsUC::addArrFirstValue($apiTypes, "", __("[Select API Type]", "unlimited-elements-for-elementor"));

		$this->settings->addSelect($apiTypeParamName, $apiTypes, $text, "", $params);

		// add text if no google api key found
		$googleApiKey = HelperProviderCoreUC_EL::getGeneralSetting("google_api_key");

		if(empty($googleApiKey)){
			
			$googleApiTypes = array(
				UniteCreatorAPIIntegrations::TYPE_GOOGLE_EVENTS,
				UniteCreatorAPIIntegrations::TYPE_GOOGLE_REVIEWS,
				UniteCreatorAPIIntegrations::TYPE_GOOGLE_SHEETS,
				UniteCreatorAPIIntegrations::TYPE_YOUTUBE_PLAYLIST,
			);

			$settingsUrl = HelperUC::getViewUrl(GlobalsUnlimitedElements::VIEW_SETTINGS_ELEMENTOR, "#tab=integrations");
			$settingsLabel = esc_html__("General Settings", "unlimited-elements-for-elementor");

			foreach($googleApiTypes as $type){
				$params = array();
				$params["origtype"] = UniteCreatorDialogParam::PARAM_STATIC_TEXT;
				$params["elementor_condition"] = array($apiTypeParamName => $type);

				$text = sprintf(__("Google API key is missing. Please add the key in the <a href='%s' target='_blank'>%s</a>.", "unlimited-elements-for-elementor"), $settingsUrl, $settingsLabel);
				$paramName = $name . "_api_" . $type . "_key_empty_text";

				$this->settings->addStaticText($text, $paramName, $params);
			}
		}

		// api type fields
		$apiTypeFields = array(
			UniteCreatorAPIIntegrations::TYPE_GOOGLE_EVENTS => array(
				array(
					"id" => UniteCreatorAPIIntegrations::GOOGLE_EVENTS_FIELD_CALENDAR_ID,
					"type" => UniteCreatorDialogParam::PARAM_TEXTFIELD,
					"text" => __("Calendar ID", "unlimited-elements-for-elementor"),
					"desc" => sprintf(__("You can find the calendar ID on a calendar's \"Settings\" page under \"Integrate Calendar\".<br />The calendar must be <a href='%s' target='_blank'>public</a>.", "unlimited-elements-for-elementor"), "https://support.google.com/calendar/answer/37082"),
				),

				array(
					"id" => UniteCreatorAPIIntegrations::GOOGLE_EVENTS_FIELD_RANGE,
					"type" => UniteCreatorDialogParam::PARAM_DROPDOWN,
					"text" => __("Date Range", "unlimited-elements-for-elementor"),
					"options" => array(
						UniteCreatorAPIIntegrations::GOOGLE_EVENTS_RANGE_UPCOMING => __("Upcoming", "unlimited-elements-for-elementor"),
						UniteCreatorAPIIntegrations::GOOGLE_EVENTS_RANGE_TODAY => __("Today's", "unlimited-elements-for-elementor"),
						UniteCreatorAPIIntegrations::GOOGLE_EVENTS_RANGE_TOMORROW => __("Tomorrow's", "unlimited-elements-for-elementor"),
						UniteCreatorAPIIntegrations::GOOGLE_EVENTS_RANGE_WEEK => __("This week", "unlimited-elements-for-elementor"),
						UniteCreatorAPIIntegrations::GOOGLE_EVENTS_RANGE_MONTH => __("This month", "unlimited-elements-for-elementor"),
					),
					"default" => UniteCreatorAPIIntegrations::GOOGLE_EVENTS_RANGE_UPCOMING,
				),
				array(
					"id" => UniteCreatorAPIIntegrations::GOOGLE_EVENTS_FIELD_ORDER,
					"type" => UniteCreatorDialogParam::PARAM_DROPDOWN,
					"text" => __("Order By", "unlimited-elements-for-elementor"),
					"options" => array(
						UniteCreatorAPIIntegrations::GOOGLE_EVENTS_ORDER_DATE_DESC => __("Date (newest)", "unlimited-elements-for-elementor"),
						UniteCreatorAPIIntegrations::GOOGLE_EVENTS_ORDER_DATE_ASC => __("Date (oldest)", "unlimited-elements-for-elementor"),
					),
					"default" => UniteCreatorAPIIntegrations::GOOGLE_EVENTS_ORDER_DATE_DESC,
				),
				array(
					"id" => UniteCreatorAPIIntegrations::GOOGLE_EVENTS_FIELD_LIMIT,
					"type" => UniteCreatorDialogParam::PARAM_TEXTFIELD,
					"text" => __("Events Limit", "unlimited-elements-for-elementor"),
					"desc" => sprintf(__("Optional. You can specify the maximum number of events: from 1 to 2500. The default value is %d.", "unlimited-elements-for-elementor"), UniteCreatorAPIIntegrations::GOOGLE_EVENTS_DEFAULT_LIMIT),
					"default" => UniteCreatorAPIIntegrations::GOOGLE_EVENTS_DEFAULT_LIMIT,
				),
				array(
					"id" => UniteCreatorAPIIntegrations::GOOGLE_EVENTS_FIELD_CACHE_TIME,
					"type" => UniteCreatorDialogParam::PARAM_TEXTFIELD,
					"text" => __("Cache Time", "unlimited-elements-for-elementor"),
					"desc" => sprintf(__("Optional. You can specify the cache time of results in minutes. The default value is %d minutes.", "unlimited-elements-for-elementor"), UniteCreatorAPIIntegrations::GOOGLE_EVENTS_DEFAULT_CACHE_TIME),
					"default" => UniteCreatorAPIIntegrations::GOOGLE_EVENTS_DEFAULT_CACHE_TIME,
				),
			),
			UniteCreatorAPIIntegrations::TYPE_GOOGLE_REVIEWS => array(
				array(
					"id" => UniteCreatorAPIIntegrations::GOOGLE_REVIEWS_FIELD_PLACE_ID,
					"type" => UniteCreatorDialogParam::PARAM_TEXTFIELD,
					"text" => __("Place ID", "unlimited-elements-for-elementor"),
					"desc" => sprintf(__("You can find the place ID by using <a href='%s' target='_blank'>Place ID Finder</a>.", "unlimited-elements-for-elementor"), "https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder"),
				),
				array(
					"id" => UniteCreatorAPIIntegrations::GOOGLE_REVIEWS_FIELD_CACHE_TIME,
					"type" => UniteCreatorDialogParam::PARAM_TEXTFIELD,
					"text" => __("Cache Time", "unlimited-elements-for-elementor"),
					"desc" => sprintf(__("Optional. You can specify the cache time of results in minutes. The default value is %d minutes.", "unlimited-elements-for-elementor"), UniteCreatorAPIIntegrations::GOOGLE_REVIEWS_DEFAULT_CACHE_TIME),
					"default" => UniteCreatorAPIIntegrations::GOOGLE_REVIEWS_DEFAULT_CACHE_TIME,
				),
			),
			UniteCreatorAPIIntegrations::TYPE_GOOGLE_SHEETS => array(
				array(
					"id" => UniteCreatorAPIIntegrations::GOOGLE_SHEETS_FIELD_ID,
					"type" => UniteCreatorDialogParam::PARAM_TEXTFIELD,
					"text" => __("Spreadsheet ID", "unlimited-elements-for-elementor"),
					"desc" => sprintf(__("You can find the spreadsheet ID in a Google Sheets URL: %s<br />The spreadsheet must be <a href='%s' target='_blank'>public</a>.", "unlimited-elements-for-elementor"), "https://docs.google.com/spreadsheets/d/<b>[YOUR_SPREADSHEET_ID]</b>/edit#gid=0", "https://support.google.com/drive/answer/2494822"),
				),
				array(
					"id" => UniteCreatorAPIIntegrations::GOOGLE_SHEETS_FIELD_SHEET_ID,
					"type" => UniteCreatorDialogParam::PARAM_TEXTFIELD,
					"text" => __("Sheet ID", "unlimited-elements-for-elementor"),
					"desc" => sprintf(__("Optional. You can find the sheet ID in a Google Sheets URL: %s", "unlimited-elements-for-elementor"), "https://docs.google.com/spreadsheets/d/aBC-123_xYz/edit#gid=<b>[YOUR_SHEET_ID]</b>"),
				),
				array(
					"id" => UniteCreatorAPIIntegrations::GOOGLE_SHEETS_FIELD_CACHE_TIME,
					"type" => UniteCreatorDialogParam::PARAM_TEXTFIELD,
					"text" => __("Cache Time", "unlimited-elements-for-elementor"),
					"desc" => sprintf(__("Optional. You can specify the cache time of results in minutes. The default value is %d minutes.", "unlimited-elements-for-elementor"), UniteCreatorAPIIntegrations::GOOGLE_SHEETS_DEFAULT_CACHE_TIME),
					"default" => UniteCreatorAPIIntegrations::GOOGLE_SHEETS_DEFAULT_CACHE_TIME,
				),
			),
			UniteCreatorAPIIntegrations::TYPE_YOUTUBE_PLAYLIST => array(
				array(
					"id" => UniteCreatorAPIIntegrations::YOUTUBE_PLAYLIST_FIELD_ID,
					"type" => UniteCreatorDialogParam::PARAM_TEXTFIELD,
					"text" => __("Playlist ID", "unlimited-elements-for-elementor"),
					"desc" => sprintf(__("You can find the playlist ID in a YouTube URL: <br />— %s<br />— %s<br />The playlist must be <a href='%s' target='_blank'>public</a>.", "unlimited-elements-for-elementor"), "https://youtube.com/playlist?list=<b>[YOUR_PLAYLIST_ID]</b>", "https://youtube.com/watch?v=aBC-123xYz&list=<b>[YOUR_PLAYLIST_ID]</b>", "https://support.google.com/youtube/answer/3127309"),
				),
				array(
					"id" => UniteCreatorAPIIntegrations::YOUTUBE_PLAYLIST_FIELD_ORDER,
					"type" => UniteCreatorDialogParam::PARAM_DROPDOWN,
					"text" => __("Order By", "unlimited-elements-for-elementor"),
					"options" => array(
						UniteCreatorAPIIntegrations::YOUTUBE_PLAYLIST_ORDER_DEFAULT => __("Default", "unlimited-elements-for-elementor"),
						UniteCreatorAPIIntegrations::YOUTUBE_PLAYLIST_ORDER_DATE_ADDED_DESC => __("Date added (newest)", "unlimited-elements-for-elementor"),
						UniteCreatorAPIIntegrations::YOUTUBE_PLAYLIST_ORDER_DATE_ADDED_ASC => __("Date added (oldest)", "unlimited-elements-for-elementor"),
						UniteCreatorAPIIntegrations::YOUTUBE_PLAYLIST_ORDER_DATE_ADDED_RANDOM => __("Date added (random)", "unlimited-elements-for-elementor"),
						UniteCreatorAPIIntegrations::YOUTUBE_PLAYLIST_ORDER_DATE_PUBLISHED_DESC => __("Date published (newest)", "unlimited-elements-for-elementor"),
						UniteCreatorAPIIntegrations::YOUTUBE_PLAYLIST_ORDER_DATE_PUBLISHED_ASC => __("Date published (oldest)", "unlimited-elements-for-elementor"),
						UniteCreatorAPIIntegrations::YOUTUBE_PLAYLIST_ORDER_DATE_PUBLISHED_RANDOM => __("Date published (random)", "unlimited-elements-for-elementor"),
					),
					"default" => UniteCreatorAPIIntegrations::YOUTUBE_PLAYLIST_ORDER_DEFAULT,
				),
				array(
					"id" => UniteCreatorAPIIntegrations::YOUTUBE_PLAYLIST_FIELD_LIMIT,
					"type" => UniteCreatorDialogParam::PARAM_TEXTFIELD,
					"text" => __("Videos Limit", "unlimited-elements-for-elementor"),
					"desc" => sprintf(__("Optional. You can specify the maximum number of videos: from 1 to 50. The default value is %d.", "unlimited-elements-for-elementor"), UniteCreatorAPIIntegrations::YOUTUBE_PLAYLIST_DEFAULT_LIMIT),
					"default" => UniteCreatorAPIIntegrations::YOUTUBE_PLAYLIST_DEFAULT_LIMIT,
				),
				array(
					"id" => UniteCreatorAPIIntegrations::YOUTUBE_PLAYLIST_FIELD_CACHE_TIME,
					"type" => UniteCreatorDialogParam::PARAM_TEXTFIELD,
					"text" => __("Cache Time", "unlimited-elements-for-elementor"),
					"desc" => sprintf(__("Optional. You can specify the cache time of results in minutes. The default value is %d minutes.", "unlimited-elements-for-elementor"), UniteCreatorAPIIntegrations::YOUTUBE_PLAYLIST_DEFAULT_CACHE_TIME),
					"default" => UniteCreatorAPIIntegrations::YOUTUBE_PLAYLIST_DEFAULT_CACHE_TIME,
				),
			),
		);

		foreach($apiTypeFields as $apiType => $fields){
			foreach($fields as $field){
				$params = array();
				$params["origtype"] = $field["type"];
				$params["elementor_condition"] = array_merge($condition, array($apiTypeParamName => $apiType));
				$params["description"] = isset($field["desc"]) ? $field["desc"] : "";

				$paramName = $name . "_api_" . $field["id"];
				$paramDefault = isset($field["default"]) ? $field["default"] : "";

				switch($field["type"]){
					case UniteCreatorDialogParam::PARAM_TEXTFIELD:
						$this->settings->addTextBox($paramName, $paramDefault, $field["text"], $params);
					break;
					case UniteCreatorDialogParam::PARAM_DROPDOWN:
						$this->settings->addSelect($paramName, array_flip($field["options"]), $field["text"], $paramDefault, $params);
					break;
					default:
						UniteFunctionsUC::throwError(__FUNCTION__ . " error - Field type \"{$field["type"]}\" is not implemented");
				}
			}
		}

		// title source select
		$titleParam = array();
		$titleParam["type"] = UniteCreatorDialogParam::PARAM_TEXTFIELD;
		$titleParam["name"] = "title";
		$titleParam["title"] = "Title";

		$this->putParamConnector_regular($name, $titleParam, $condition, self::TYPE_API);

		// items source select
		foreach($this->paramsItems as $itemParam){
			$this->putParamConnector_regular($name, $itemParam, $condition, self::TYPE_API);
		}
	}

	/**
	 * add multisource connectors - repeater
	 */
	private function addMultisourceConnectors_repeater($name, $arrIncludedAttributes){

		$isAcfExists = UniteCreatorAcfIntegrate::isAcfActive();

		$paramsItems = $this->objAddon->getParamsItems();

		$paramsItems = $this->filterParamItemsByIncludedAttributes($paramsItems, $arrIncludedAttributes);

		if(empty($paramsItems))
			return(false);

		$condition = array($name."_source"=>"repeater");

		//-------------- repeater meta name ----------------

		$params = array();
		$params["origtype"] = UniteCreatorDialogParam::PARAM_TEXTFIELD;
		$params["elementor_condition"] = $condition;

		if($isAcfExists == false)
			$params["description"] = __("Choose meta field name it should be some array at the output", "unlimited-elements-for-elementor");
		else
			$params["description"] = __("Choose ACF field name. Repeater, Media, or types with items array output", "unlimited-elements-for-elementor");


		if($isAcfExists == false)
			$text = __("Meta Field Name", "unlimited-elements-for-elementor");
		else
			$text = __("ACF Field Name", "unlimited-elements-for-elementor");

		$this->settings->addTextBox($name."_repeater_name", "", $text, $params);

		// --- fields location -----------

		$params = array();
		$params["origtype"] = UniteCreatorDialogParam::PARAM_DROPDOWN;
		$params["elementor_condition"] = $condition;

		if($isAcfExists == false)
			$text = __("Meta Field Location", "unlimited-elements-for-elementor");
		else
			$text = __("ACF Field Location", "unlimited-elements-for-elementor");

		$arrLocations = array();
		$arrLocations["current_post"] = __("Current Post", "unlimited-elements-for-elementor");
		$arrLocations["parent_post"] = __("Parent Post", "unlimited-elements-for-elementor");
		$arrLocations["selected_post"] = __("Select Post", "unlimited-elements-for-elementor");
		$arrLocations["current_term"] = __("Current Term", "unlimited-elements-for-elementor");
		$arrLocations["parent_term"] = __("Parent Term", "unlimited-elements-for-elementor");
		$arrLocations["current_user"] = __("Current User", "unlimited-elements-for-elementor");

		$arrLocations = array_flip($arrLocations);

		$this->settings->addSelect($name."_repeater_location", $arrLocations, $text, "current_post", $params);

		// --- location post select -----------

		if($isAcfExists == false)
			$text = __("Meta Field From Post", "unlimited-elements-for-elementor");
		else
			$text = __("ACF Field From Post", "unlimited-elements-for-elementor");

		$conditionRepeaterPost = $condition;
		$conditionRepeaterPost[$name."_repeater_location"] = "selected_post";

		$this->settings->addPostIDSelect($name."_repeater_post", $text, $conditionRepeaterPost, "single");


		//--------- h3 before meta ----------

		$params = array();
		$params["origtype"] = UniteCreatorDialogParam::PARAM_HR;
		$params["elementor_condition"] = $condition;

		$this->settings->addHr($name."_hr_before_repeater_items_source",$params);


		$titleParam = array();
		$titleParam["type"] = UniteCreatorDialogParam::PARAM_TEXTFIELD;
		$titleParam["name"] = "title";
		$titleParam["title"] = "Title";

		$this->putParamConnector_regular($name, $titleParam, $condition, self::TYPE_REPEATER);


		// --- items source select

		foreach($this->paramsItems as $itemParam){

			$this->putParamConnector_regular($name, $itemParam, $condition, self::TYPE_REPEATER);
		}

	}

	/**
	 * add dynamic field
	 */
	private function addMultisourceConnectors_gallery($name, $arrIncludedAttributes){

		$condition = array($name."_source"=>self::TYPE_GALLERY);

		//add the title

		$titleParam = array();
		$titleParam["type"] = UniteCreatorDialogParam::PARAM_TEXTFIELD;
		$titleParam["name"] = "title";
		$titleParam["title"] = "Title";

		$this->putParamConnector_regular($name, $titleParam, $condition, self::TYPE_GALLERY);


		// --- items source select
		foreach($this->paramsItems as $itemParam){

			$this->putParamConnector_regular($name, $itemParam, $condition, self::TYPE_GALLERY);
		}



	}



	/**
	 * add dynamic field
	 */
	private function addMultisourceConnectors_jsonCsv($name, $arrIncludedAttributes){

		$condition = array($name."_source"=>"json_csv");

		//-------------- csv location ----------------

		$params = array();
		$params["origtype"] = UniteCreatorDialogParam::PARAM_DROPDOWN;
		$params["elementor_condition"] = $condition;

		$text = __("JSON or CSV Location", "unlimited-elements-for-elementor");

		$arrLocations = array();
		$arrLocations["textarea"] = __("Dynamic Textarea", "unlimited-elements-for-elementor");
		$arrLocations["url"] = __("Url", "unlimited-elements-for-elementor");

		$arrLocations = array_flip($arrLocations);

		$this->settings->addSelect($name."_json_csv_location", $arrLocations, $text, "textarea", $params);

		//-------------- dynamic field ----------------

		$conditionField = $condition;
		$conditionField[$name."_json_csv_location"] = "textarea";

		$params = array();
		$params["origtype"] = UniteCreatorDialogParam::PARAM_TEXTAREA;
		$params["elementor_condition"] = $conditionField;
		$params["description"] = __("Put some JSON data or CSV data of array with the items, or choose from dynamic field", "unlimited-elements-for-elementor");
		$params["add_dynamic"] = true;

		$text = __("JSON or CSV Items Data", "unlimited-elements-for-elementor");

		$this->settings->addTextBox($name."_json_csv_dynamic_field", "", $text, $params);

		//-------------- csv url ----------------

		$conditionUrl = $condition;
		$conditionUrl[$name."_json_csv_location"] = "url";

		$params = array();
		$params["origtype"] = UniteCreatorDialogParam::PARAM_TEXTFIELD;
		$params["elementor_condition"] = $conditionUrl;
		$params["description"] = __("Enter url of the the file or webhook. inside or outside of the website", "unlimited-elements-for-elementor");
		$params["placeholder"] = "Example: https://yoursite.com/yourfile.json";
		$params["add_dynamic"] = true;
		$params["label_block"] = true;

		$text = __("Url with the JSON or CSV", "unlimited-elements-for-elementor");

		$this->settings->addTextBox($name."_json_csv_url", "", $text, $params);


		//--------- h3 before connectors ----------

		$params = array();
		$params["origtype"] = UniteCreatorDialogParam::PARAM_HR;
		$params["elementor_condition"] = $condition;

		$this->settings->addHr($name."_hr_before_connectors",$params);

		$titleParam = array();
		$titleParam["type"] = UniteCreatorDialogParam::PARAM_TEXTFIELD;
		$titleParam["name"] = "title";
		$titleParam["title"] = "Title";

		$this->putParamConnector_regular($name, $titleParam, $condition, self::TYPE_JSONCSV);


		// --- items source select
		foreach($this->paramsItems as $itemParam){

			$this->putParamConnector_regular($name, $itemParam, $condition, self::TYPE_JSONCSV);
		}



	}


	private function _________SINGLE_PARAM_CONNECTOR__________(){}


	/**
	 * get post param connector
	 */
	private function putParamConnector_object($fieldName, $param, $condition, $type){

		$title = UniteFunctionsUC::getVal($param, "title");

		if(empty($title))
			return(false);

		$name = UniteFunctionsUC::getVal($param, "name");

		if(empty($name))
			return(false);

		$paramType = UniteFunctionsUC::getVal($param, "type");

		//-------------- select param ----------------

		//get fields

		$default = "";
		$titleDefault = null;
		$imageDefault = null;

		$putTextBeforeAfter = true;

		switch($type){
			case self::TYPE_POSTS:
				$arrFields = $this->arrPostFields;

				if($paramType == UniteCreatorDialogParam::PARAM_IMAGE){
					$arrFields = $this->arrPostImageFields;
					$putTextBeforeAfter = false;
				}

				$titleDefault = "title";
				$imageDefault = "image";

			break;
			case self::TYPE_PRODUCTS:
				$arrFields = $this->arrProductsFields;

				if($paramType == UniteCreatorDialogParam::PARAM_IMAGE){
					$arrFields = $this->arrPostImageFields;
					$putTextBeforeAfter = false;
				}

				$titleDefault = "title";
				$imageDefault = "image";

			break;
			case self::TYPE_TERMS:
				$arrFields = $this->arrTermsFields;
				$titleDefault = "name";

			break;
			case self::TYPE_USERS:
				$arrFields = $this->arrUsersFields;
				$titleDefault = "name";

			break;
			case self::TYPE_MENU:
				$arrFields = $this->arrMenuFields;
				$titleDefault = "title";
			break;
			default:

				UniteFunctionsUC::throwError("putParamConnector_object error - Wrong type: $type");
			break;
		}

		if($name == "title" && !empty($titleDefault))
			$default = $titleDefault;

		if($paramType == UniteCreatorDialogParam::PARAM_IMAGE && !empty($imageDefault))
			$default = $imageDefault;


		$params = array();
		$params["elementor_condition"] = $condition;
		$params["origtype"] = UniteCreatorDialogParam::PARAM_MULTIPLE_SELECT;
		$params["placeholder"] = "Leave empty for default value";

		$text = $title. " ".__("Source", "unlimited-elements-for-elementor");

		$selectName = $fieldName."_{$type}_field_source_$name";

		$this->settings->addMultiSelect($selectName, $arrFields, $text, $default, $params);


		//-------------- meta field ----------------

		$conditionMetaField = $condition;
		$conditionMetaField[$selectName] = "meta_field";

		$params = array();
		$params["origtype"] = UniteCreatorDialogParam::PARAM_TEXTFIELD;
		$params["elementor_condition"] = $conditionMetaField;

		$text = $title. " ".__("Meta Field", "unlimited-elements-for-elementor");

		$this->settings->addTextBox($fieldName."_{$type}_field_meta_{$name}", "", $text, $params);

		//-------------- taxonomy ----------------

		$conditionMetaField = $condition;
		$conditionMetaField[$selectName] = "term_field";

		$params = array();
		$params["origtype"] = UniteCreatorDialogParam::PARAM_TEXTFIELD;
		$params["elementor_condition"] = $conditionMetaField;

		if($type == self::TYPE_PRODUCTS){
			$params["description"] = __("Write here the taxonomy name. Like: product_cat ","unlimited-elements-for-elementor");
			$params["placeholder"] = __("Example: product_cat","unlimited-elements-for-elementor");
		}else{
			$params["description"] = __("Write here the taxonomy name of the current post type. Like: category or post_tag (in posts)","unlimited-elements-for-elementor");
			$params["placeholder"] = __("Example: post_tag","unlimited-elements-for-elementor");
		}

		$text = $title. " ".__("Taxonomy", "unlimited-elements-for-elementor");

		$this->settings->addTextBox($fieldName."_{$type}_field_taxonomy_{$name}", "", $text, $params);


		//-------------- static value ----------------

		$conditionStaticValue = $condition;
		$conditionStaticValue[$selectName] = "static_value";

		$params = array();
		$params["origtype"] = UniteCreatorDialogParam::PARAM_TEXTFIELD;
		$params["elementor_condition"] = $conditionStaticValue;
		$params["label_block"] = true;

		$text = $title. " ".__("Static Value", "unlimited-elements-for-elementor");

		$this->settings->addTextBox($fieldName."_{$type}_field_value_{$name}", "", $text, $params);


		if($putTextBeforeAfter == true){

			//-------------- text before ----------------

			$conditionTextBefore = $condition;
			$conditionTextBefore[$selectName] = "text_before";

			$params = array();
			$params["origtype"] = UniteCreatorDialogParam::PARAM_TEXTFIELD;
			$params["elementor_condition"] = $conditionTextBefore;
			$params["label_block"] = true;

			$text = $title. " ".__("Text Before", "unlimited-elements-for-elementor");

			$this->settings->addTextBox($fieldName."_{$type}_text_before_{$name}", "", $text, $params);


			//-------------- text after ----------------

			$conditionTextAfter = $condition;
			$conditionTextAfter[$selectName] = "text_after";

			$params = array();
			$params["origtype"] = UniteCreatorDialogParam::PARAM_TEXTFIELD;
			$params["elementor_condition"] = $conditionTextAfter;
			$params["label_block"] = true;

			$text = $title. " ".__("Text After", "unlimited-elements-for-elementor");

			$this->settings->addTextBox($fieldName."_{$type}_text_after_{$name}", "", $text, $params);

			//-------------- separator ----------------

			$conditionSep = $condition;
			$conditionSep[$selectName] = "separator";

			$params = array();
			$params["origtype"] = UniteCreatorDialogParam::PARAM_TEXTFIELD;
			$params["elementor_condition"] = $conditionSep;

			$text = $title. " ".__("Separator", "unlimited-elements-for-elementor");

			$this->settings->addTextBox($fieldName."_{$type}_separator_{$name}", "", $text, $params);

			//-------------- truncate ----------------

			$conditionTruncate = $condition;
			$conditionTruncate[$selectName] = "truncate";

			$params = array();
			$params["origtype"] = UniteCreatorDialogParam::PARAM_NUMBER;
			$params["elementor_condition"] = $conditionTruncate;

			$text = $title. " ".__("Truncate Characters", "unlimited-elements-for-elementor");

			$this->settings->addTextBox($fieldName."_{$type}_truncate_{$name}", "100", $text, $params);

		}


	}

	/**
	 * get post param connector
	 */
	private function putParamConnector_regular($fieldName, $param, $condition, $type){

		$defaulTitle = null;
		$defaultImage = null;

		switch($type){
			case self::TYPE_REPEATER:
			default:
				$paramName = $fieldName."_repeater";
			break;
			case self::TYPE_JSONCSV:
				$paramName = $fieldName."_json_csv";
			break;
			case self::TYPE_INSTAGRAM:
				$paramName = $fieldName."_instagram";

				$defaulTitle = "caption_text";
				$defaultImage = "image";
			break;
			case self::TYPE_GALLERY:
				$paramName = $fieldName."_gallery";
			break;
			case self::TYPE_API:
				$paramName = $fieldName."_api";
			break;

		}


		$title = UniteFunctionsUC::getVal($param, "title");

		if(empty($title))
			return(false);

		$name = UniteFunctionsUC::getVal($param, "name");

		if(empty($name))
			return(false);

		$paramType = UniteFunctionsUC::getVal($param, "type");


		$fieldTitle = __("Repeater Field Name","unlimited-elements-for-elementor");

		if(self::TYPE_JSONCSV)
			$fieldTitle = __("Item Field Name","unlimited-elements-for-elementor");


		//-------------- select type ----------------

		//get options


		if($type == self::TYPE_INSTAGRAM)
			$arrOptions = $this->arrInstaFields;
		elseif($type == self::TYPE_GALLERY)
			$arrOptions = $this->arrGalleryFields;
		else{		//for csv and repeater

			$arrOptions = array(
				"static_value"=>__("-- Static Value --","unlimited-elements-for-elementor"),
				"text_before"=>__("-- Text Before --","unlimited-elements-for-elementor"),
				"text_after"=>__("-- Text After --","unlimited-elements-for-elementor"),
				"separator"=>__("-- Separator --","unlimited-elements-for-elementor"),
				"field"=>$fieldTitle,
				"truncate"=>__("-- Truncate Text --","unlimited-elements-for-elementor")
			);

			$arrOptions = array_flip($arrOptions);
		}

		//set defaults

		$default = "default";

		if($name == "title" && !empty($defaulTitle))
			$default = $defaulTitle;

		if($paramType == UniteCreatorDialogParam::PARAM_IMAGE && !empty($defaultImage))
			$default = $defaultImage;


		$params = array();
		$params["origtype"] = UniteCreatorDialogParam::PARAM_MULTIPLE_SELECT;
		$params["elementor_condition"] = $condition;

		$text = $title. " ".__("Source", "unlimited-elements-for-elementor");

		$selectName = $paramName."_field_source_$name";

		$this->settings->addMultiSelect($selectName, $arrOptions, $text, $default, $params);


		//-------------- repeater field ----------------

		if($type != self::TYPE_INSTAGRAM){

			$conditionDataField = $condition;
			$conditionDataField[$selectName] = "field";

			$params = array();
			$params["origtype"] = UniteCreatorDialogParam::PARAM_TEXTFIELD;
			$params["elementor_condition"] = $conditionDataField;

			$text = $title. " ".$fieldTitle;

			$this->settings->addTextBox($paramName."_field_name_{$name}", "", $text, $params);

		}


		//-------------- static value ----------------

		$conditionDataField = $condition;
		$conditionStaticValue[$selectName] = "static_value";

		$params = array();
		$params["origtype"] = UniteCreatorDialogParam::PARAM_TEXTFIELD;
		$params["elementor_condition"] = $conditionStaticValue;
		$params["label_block"] = true;

		$text = $title. " ".__("Static Value", "unlimited-elements-for-elementor");

		$this->settings->addTextBox($paramName."_field_value_{$name}", "", $text, $params);


		//-------------- text before ----------------

		$conditionTextBefore = $condition;
		$conditionTextBefore[$selectName] = "text_before";

		$params = array();
		$params["origtype"] = UniteCreatorDialogParam::PARAM_TEXTFIELD;
		$params["elementor_condition"] = $conditionTextBefore;
		$params["label_block"] = true;

		$text = $title. " ".__("Text Before", "unlimited-elements-for-elementor");

		$this->settings->addTextBox($fieldName."_{$type}_text_before_{$name}", "", $text, $params);


		//-------------- text after ----------------

		$conditionTextAfter = $condition;
		$conditionTextAfter[$selectName] = "text_after";

		$params = array();
		$params["origtype"] = UniteCreatorDialogParam::PARAM_TEXTFIELD;
		$params["elementor_condition"] = $conditionTextAfter;
		$params["label_block"] = true;

		$text = $title. " ".__("Text After", "unlimited-elements-for-elementor");

		$this->settings->addTextBox($fieldName."_{$type}_text_after_{$name}", "", $text, $params);

		//-------------- separator ----------------

		$conditionSep = $condition;
		$conditionSep[$selectName] = "separator";

		$params = array();
		$params["origtype"] = UniteCreatorDialogParam::PARAM_TEXTFIELD;
		$params["elementor_condition"] = $conditionSep;

		$text = $title. " ".__("Separator", "unlimited-elements-for-elementor");

		$this->settings->addTextBox($fieldName."_{$type}_separator_{$name}", "", $text, $params);

		//-------------- truncate ----------------

		$conditionTruncate = $condition;
		$conditionTruncate[$selectName] = "truncate";

		$params = array();
		$params["origtype"] = UniteCreatorDialogParam::PARAM_NUMBER;
		$params["elementor_condition"] = $conditionTruncate;

		$text = $title. " ".__("Truncate Characters", "unlimited-elements-for-elementor");

		$this->settings->addTextBox($fieldName."_{$type}_truncate_{$name}", "100", $text, $params);


	}



}
