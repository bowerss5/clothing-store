<?php
class final_rest
{



	/**
	 * @api  /api/v1/setTemp/
	 * @apiName setTemp
	 * @apiDescription Add remote temperature measurement
	 *
	 * @apiParam {string} location
	 * @apiParam {String} sensor
	 * @apiParam {double} value
	 *
	 * @apiSuccess {Integer} status
	 * @apiSuccess {string} message
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
	 *     {
	 *              "status":0,
	 *              "message": ""
	 *     }
	 *
	 * @apiError Invalid data types
	 *
	 * @apiErrorExample Error-Response:
	 *     HTTP/1.1 200 OK
	 *     {
	 *              "status":1,
	 *              "message":"Error Message"
	 *     }
	 *
	 */
	public static function setTemp($location, $sensor, $value)
	{
		if (!is_numeric($value)) {
			$retData["status"] = 1;
			$retData["message"] = "'$value' is not numeric";
		} else {
			try {
				EXEC_SQL("insert into temperature (location, sensor, value, date) values (?,?,?,CURRENT_TIMESTAMP)", $location, $sensor, $value);
				$retData["status"] = 0;
				$retData["message"] = "insert of '$value' for location: '$location' and sensor '$sensor' accepted";
			} catch (Exception $e) {
				$retData["status"] = 1;
				$retData["message"] = $e->getMessage();
			}
		}

		return json_encode($retData);
	}
	/**
	 * @api  /api/v1/getProduct/
	 * @apiName getProduct
	 * @apiDescription Get list of products.
	 *
	 * @apiParam {string} category
	 * @apiParam {String} subcategory
	 * @apiParam {Integer} id
	 *
	 * @apiSuccess {Integer} status
	 * @apiSuccess {string} message
	 * @apiSuccess {Array} result
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
	 *     {
	 *              "status":0,
	 *              "message": ""
	 * 				"result": []
	 *     }
	 *
	 * @apiError Invalid data types
	 *
	 * @apiErrorExample Error-Response:
	 *     HTTP/1.1 200 OK
	 *     {
	 *              "status":1,
	 *              "message":"Error Message"
	 *     }
	 *
	 */
	public static function getProduct($category, $subcategory, $id)
	{
		try {
			$retData["status"] = 0;
			$retData["message"] = "Query Successful.";
			$retData["result"] = GET_SQL("select * from
			product where category like ? and subcategory
			like ? and (product_id = ? or ? = '0') order by
			description", $category, $subcategory, $id, $id);
		} catch (Exception $e) {
			$retData["status"] = 1;
			$retData["message"] = $e->getMessage();
		}

		return json_encode($retData);
	}

	public static function getCategories()
	{
		try {
			$retData["status"] = 0;
			$retData["message"] = "Query Successful.";
			$retData["result"] = GET_SQL("SELECT DISTINCT category FROM product");
		} catch (Exception $e) {
			$retData["status"] = 1;
			$retData["message"] = $e->getMessage();
		}

		return json_encode($retData);
	}
	public static function getSubCategories($category)
	{
		try {
			$retData["status"] = 0;
			$retData["message"] = "Query Successful.";
			$retData["result"] = GET_SQL("SELECT DISTINCT subcategory FROM product WHERE category like ?", $category);
		} catch (Exception $e) {
			$retData["status"] = 1;
			$retData["message"] = $e->getMessage();
		}

		return json_encode($retData);
	}

	public static function openCart()
	{
		try {
			GET_SQL("INSERT INTO cart (cartID,closed) VALUES (NULL,'FALSE')");

			$retData["status"] = 0;
			$retData["message"] = "Cart opened successfully.";
			$retData["cartID"] = intval(GET_SQL("select max(cartID) as cartID from cart")[0]["cartID"]);
		} catch (Exception $e) {
			$retData["status"] = 1;
			$retData["message"] = "Error opening cart: " . $e->getMessage();
		}

		return json_encode($retData);
	}

	public static function addToCart($cart, $product, $quantity, $price)
	{
		
	}

}

